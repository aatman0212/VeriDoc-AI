import cv2
import numpy as np
import base64
import io
from PIL import Image
from typing import Dict, Any, Tuple

class DocumentPreprocessor:
    """
    Stage 1: Preprocessing — OpenCV (no AI)
    - Grayscale conversion + denoising (fastNlMeansDenoising)
    - Contrast enhancement (CLAHE)
    - Document boundary detection & crop (contour detection)
    - Deskew (Hough line transform / minAreaRect)
    - Resolution normalization
    """

    def __init__(self, target_width: int = 1200):
        self.target_width = target_width
        self.clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))

    def normalize_resolution(self, img: np.ndarray) -> np.ndarray:
        """Normalize resolution to standard width while preserving aspect ratio."""
        h, w = img.shape[:2]
        if w == 0 or h == 0:
            return img
        if w != self.target_width:
            scale = self.target_width / float(w)
            target_h = max(10, int(h * scale))
            return cv2.resize(img, (self.target_width, target_h), interpolation=cv2.INTER_AREA if scale < 1.0 else cv2.INTER_CUBIC)
        return img

    def denoise(self, img: np.ndarray) -> np.ndarray:
        """Denoise image using fast non-local means denoising."""
        try:
            if len(img.shape) == 3 and img.shape[2] == 3:
                return cv2.fastNlMeansDenoisingColored(img, None, h=7, hColor=7, templateWindowSize=5, searchWindowSize=15)
            else:
                return cv2.fastNlMeansDenoising(img, None, h=7, templateWindowSize=5, searchWindowSize=15)
        except Exception:
            return cv2.GaussianBlur(img, (3, 3), 0)

    def enhance_contrast(self, img: np.ndarray) -> np.ndarray:
        """Apply CLAHE contrast enhancement in LAB color space."""
        try:
            if len(img.shape) == 3 and img.shape[2] == 3:
                lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
                l, a, b = cv2.split(lab)
                l2 = self.clahe.apply(l)
                enhanced_lab = cv2.merge((l2, a, b))
                return cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2BGR)
            else:
                return self.clahe.apply(img)
        except Exception:
            return img

    def detect_and_crop(self, img: np.ndarray) -> Tuple[np.ndarray, bool]:
        """Detect document boundary contour and perspective crop."""
        try:
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) if len(img.shape) == 3 else img
            blurred = cv2.GaussianBlur(gray, (5, 5), 0)
            edged = cv2.Canny(blurred, 50, 200)

            contours, _ = cv2.findContours(edged.copy(), cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
            contours = sorted(contours, key=cv2.contourArea, reverse=True)[:5]

            for c in contours:
                peri = cv2.arcLength(c, True)
                approx = cv2.approxPolyDP(c, 0.02 * peri, True)
                if len(approx) == 4 and cv2.contourArea(c) > (img.shape[0] * img.shape[1] * 0.25):
                    pts = approx.reshape(4, 2)
                    rect = np.zeros((4, 2), dtype="float32")
                    s = pts.sum(axis=1)
                    rect[0] = pts[np.argmin(s)]
                    rect[2] = pts[np.argmax(s)]
                    diff = np.diff(pts, axis=1)
                    rect[1] = pts[np.argmin(diff)]
                    rect[3] = pts[np.argmax(diff)]

                    (tl, tr, br, bl) = rect
                    widthA = np.sqrt(((br[0] - bl[0]) ** 2) + ((br[1] - bl[1]) ** 2))
                    widthB = np.sqrt(((tr[0] - tl[0]) ** 2) + ((tr[1] - tl[1]) ** 2))
                    maxWidth = max(int(widthA), int(widthB))

                    heightA = np.sqrt(((tr[0] - br[0]) ** 2) + ((tr[1] - br[1]) ** 2))
                    heightB = np.sqrt(((tl[0] - bl[0]) ** 2) + ((tl[1] - bl[1]) ** 2))
                    maxHeight = max(int(heightA), int(heightB))

                    if maxWidth > 100 and maxHeight > 100:
                        dst = np.array([
                            [0, 0],
                            [maxWidth - 1, 0],
                            [maxWidth - 1, maxHeight - 1],
                            [0, maxHeight - 1]
                        ], dtype="float32")
                        M = cv2.getPerspectiveTransform(rect, dst)
                        warped = cv2.warpPerspective(img, M, (maxWidth, maxHeight))
                        return warped, True
        except Exception:
            pass
        return img, False

    def deskew(self, img: np.ndarray) -> Tuple[np.ndarray, float]:
        """Detect dominant orientation using Hough Line Transform and correct skew angle."""
        try:
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) if len(img.shape) == 3 else img
            edges = cv2.Canny(gray, 50, 150, apertureSize=3)
            lines = cv2.HoughLinesP(edges, 1, np.pi / 180, threshold=100, minLineLength=img.shape[1] // 4, maxLineGap=20)

            angles = []
            if lines is not None:
                for line in lines:
                    x1, y1, x2, y2 = line[0]
                    angle = np.degrees(np.arctan2(y2 - y1, x2 - x1))
                    if abs(angle) < 45:
                        angles.append(angle)

            skew_angle = float(np.median(angles)) if len(angles) > 0 else 0.0

            if abs(skew_angle) > 0.5:
                (h, w) = img.shape[:2]
                center = (w // 2, h // 2)
                M = cv2.getRotationMatrix2D(center, skew_angle, 1.0)
                rotated = cv2.warpAffine(img, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
                return rotated, round(skew_angle, 2)
        except Exception:
            pass
        return img, 0.0

    def process(self, img: np.ndarray) -> Dict[str, Any]:
        """Execute full Stage 1 Preprocessing sequence."""
        cropped_img, was_cropped = self.detect_and_crop(img)
        deskewed_img, skew_angle = self.deskew(cropped_img)
        normalized_img = self.normalize_resolution(deskewed_img)
        denoised_img = self.denoise(normalized_img)
        enhanced_img = self.enhance_contrast(denoised_img)

        # Convert to base64 for frontend preview
        _, buffer = cv2.imencode('.jpg', enhanced_img, [cv2.IMWRITE_JPEG_QUALITY, 90])
        b64_str = base64.b64encode(buffer).decode('utf-8')

        return {
            "processed_image": enhanced_img,
            "processed_b64": f"data:image/jpeg;base64,{b64_str}",
            "metadata": {
                "cropped": was_cropped,
                "skew_angle": skew_angle,
                "normalized_width": enhanced_img.shape[1],
                "normalized_height": enhanced_img.shape[0],
                "clahe_applied": True,
                "denoising_applied": True,
                "stage": "Stage 1: Preprocessing (OpenCV)"
            }
        }
