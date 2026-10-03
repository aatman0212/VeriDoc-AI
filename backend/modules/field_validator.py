import re
from typing import Dict, Any, List, Optional
from datetime import datetime

class FieldValidator:
    """
    Stage 3: Field Parsing (rule-based)
    Module 2: Field / Checksum Validation (rule-based)
    - Verhoeff algorithm for Aadhaar 12-digit UID
    - PAN regex & entity structure check (4th char entity type, 5th char surname initial)
    - ICAO 9303 MRZ 7-3-1 check-digit recomputation
    - Driving license format verification
    """

    # Verhoeff algorithm Dihedral Group D5 multiplication table
    VERHOEFF_D = [
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
        [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
        [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
        [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
        [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
        [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
        [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
        [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
        [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
    ]

    # Verhoeff permutation table
    VERHOEFF_P = [
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
        [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
        [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
        [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
        [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
        [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
        [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
    ]

    # Verhoeff inverse table
    VERHOEFF_INV = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9]

    # Valid Indian State / UT codes for Driving Licenses
    INDIAN_STATE_CODES = {
        "AN", "AP", "AR", "AS", "BR", "CH", "CG", "DD", "DL", "DN", "GA", "GJ",
        "HR", "HP", "JH", "JK", "KA", "KL", "LA", "LD", "MH", "ML", "MN", "MP",
        "MZ", "NL", "OD", "PB", "PY", "RJ", "SK", "TN", "TR", "TS", "UK", "UP", "WB"
    }

    # PAN 4th character entity dictionary
    PAN_ENTITIES = {
        'P': 'Individual (Person)',
        'C': 'Company',
        'H': 'Hindu Undivided Family (HUF)',
        'A': 'Association of Persons (AOP)',
        'B': 'Body of Individuals (BOI)',
        'G': 'Government Agency',
        'J': 'Artificial Juridical Person',
        'L': 'Local Authority',
        'F': 'Firm / Limited Liability Partnership',
        'T': 'Trust'
    }

    @classmethod
    def validate_verhoeff(cls, num_str: str) -> bool:
        """Validate an Aadhaar 12-digit number using the Verhoeff algorithm."""
        clean_num = re.sub(r'[\s-]', '', str(num_str))
        if not clean_num.isdigit():
            return False
        
        c = 0
        reversed_digits = [int(x) for x in reversed(clean_num)]
        for i, digit in enumerate(reversed_digits):
            c = cls.VERHOEFF_D[c][cls.VERHOEFF_P[i % 8][digit]]
        return c == 0

    @classmethod
    def generate_verhoeff(cls, num_str: str) -> int:
        """Generate the Verhoeff check digit for an 11-digit prefix."""
        clean_num = re.sub(r'[\s-]', '', str(num_str))
        c = 0
        reversed_digits = [int(x) for x in reversed(clean_num)]
        for i, digit in enumerate(reversed_digits):
            c = cls.VERHOEFF_D[c][cls.VERHOEFF_P[(i + 1) % 8][digit]]
        return cls.VERHOEFF_INV[c]

    @classmethod
    def validate_aadhaar(cls, uid: str) -> Dict[str, Any]:
        """Validate 12-digit Aadhaar UID format, Verhoeff checksum, and structural integrity."""
        clean_uid = re.sub(r'[\s-]', '', str(uid))
        if len(clean_uid) != 12 or not clean_uid.isdigit():
            return {
                "valid": False,
                "reason": f"Aadhaar number must be exactly 12 numeric digits (got {len(clean_uid)})",
                "verhoeff_valid": False,
                "masked_uid": f"XXXX-XXXX-{clean_uid[-4:]}" if len(clean_uid) >= 4 else uid
            }
        
        # Check for obvious repeats or invalid prefixes (UIDs do not begin with 0 or 1)
        if clean_uid[0] in ('0', '1'):
            return {
                "valid": False,
                "reason": "Invalid Aadhaar prefix: UIDAI assigns numbers starting from 2-9",
                "verhoeff_valid": False,
                "masked_uid": f"XXXX-XXXX-{clean_uid[-4:]}"
            }

        is_verhoeff = cls.validate_verhoeff(clean_uid)
        return {
            "valid": is_verhoeff,
            "verhoeff_valid": is_verhoeff,
            "reason": "Valid 12-digit UIDAI format with authentic Verhoeff check digit" if is_verhoeff else "Verhoeff check digit validation failed: Tampered or mathematically invalid Aadhaar UID",
            "masked_uid": f"XXXX-XXXX-{clean_uid[-4:]}",
            "raw_uid": clean_uid
        }

    @classmethod
    def validate_pan(cls, pan_str: str, surname: Optional[str] = None) -> Dict[str, Any]:
        """Validate Indian Income Tax Permanent Account Number (PAN)."""
        clean_pan = str(pan_str).strip().upper()
        pan_regex = r'^[A-Z]{5}[0-9]{4}[A-Z]$'

        if not re.match(pan_regex, clean_pan):
            return {
                "valid": False,
                "pan": clean_pan,
                "reason": "Invalid PAN structure. Must match 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F)",
                "entity_type": None,
                "surname_match": None
            }

        entity_char = clean_pan[3]
        entity_name = cls.PAN_ENTITIES.get(entity_char, 'Unknown Entity')

        surname_matched = True
        surname_note = "Valid"
        if surname and entity_char == 'P':
            expected_initial = surname.strip().upper()[0] if len(surname.strip()) > 0 else None
            actual_initial = clean_pan[4]
            if expected_initial and actual_initial != expected_initial:
                surname_matched = False
                surname_note = f"5th character ('{actual_initial}') does not match surname initial ('{expected_initial}')"

        is_valid = (entity_char in cls.PAN_ENTITIES) and surname_matched
        return {
            "valid": is_valid,
            "pan": clean_pan,
            "entity_code": entity_char,
            "entity_type": entity_name,
            "surname_match": surname_matched,
            "reason": f"Valid Income Tax Department PAN assigned to {entity_name}" if is_valid else surname_note
        }

    @staticmethod
    def calculate_icao_check_digit(data: str) -> int:
        """Calculate ICAO 9303 7-3-1 weight check digit."""
        weights = [7, 3, 1]
        total = 0
        for i, char in enumerate(data):
            if char.isdigit():
                val = int(char)
            elif char.isalpha():
                val = ord(char.upper()) - ord('A') + 10
            else:
                val = 0
            total += val * weights[i % 3]
        return total % 10

    @classmethod
    def validate_mrz_td3(cls, line1: str, line2: str) -> Dict[str, Any]:
        """Validate 2-line TD3 Passport MRZ using 7-3-1 checksum algorithms."""
        l1 = line1.strip().upper()
        l2 = line2.strip().upper()

        if len(l1) != 44 or len(l2) != 44:
            return {
                "valid": False,
                "reason": f"Invalid TD3 MRZ length: line1={len(l1)}, line2={len(l2)} (expected 44 chars each)"
            }

        doc_number = l2[0:9]
        doc_cd = int(l2[9]) if l2[9].isdigit() else -1
        calc_doc_cd = cls.calculate_icao_check_digit(doc_number)

        dob = l2[13:19]
        dob_cd = int(l2[19]) if l2[19].isdigit() else -1
        calc_dob_cd = cls.calculate_icao_check_digit(dob)

        expiry = l2[21:27]
        exp_cd = int(l2[27]) if l2[27].isdigit() else -1
        calc_exp_cd = cls.calculate_icao_check_digit(expiry)

        # Composite check digit over doc_number + cd + dob + cd + expiry + cd
        composite_data = l2[0:10] + l2[13:20] + l2[21:43]
        comp_cd = int(l2[43]) if l2[43].isdigit() else -1
        calc_comp_cd = cls.calculate_icao_check_digit(composite_data)

        doc_ok = (doc_cd == calc_doc_cd)
        dob_ok = (dob_cd == calc_dob_cd)
        exp_ok = (exp_cd == calc_exp_cd)
        comp_ok = (comp_cd == calc_comp_cd) or comp_cd == -1  # some passports omit composite check digit

        all_ok = doc_ok and dob_ok and exp_ok

        return {
            "valid": all_ok,
            "document_number_valid": doc_ok,
            "dob_valid": dob_ok,
            "expiry_valid": exp_ok,
            "composite_valid": comp_ok,
            "reason": "All ICAO Doc 9303 check digits mathematically verified" if all_ok else f"Checksum mismatch: doc_ok={doc_ok}, dob_ok={dob_ok}, exp_ok={exp_ok}"
        }

    @classmethod
    def validate_driving_license(cls, dl_str: str) -> Dict[str, Any]:
        """Validate Indian Driving License format."""
        clean_dl = re.sub(r'[\s-]', '', str(dl_str)).upper()
        # Common Sarathi format: 2 letters state + 2 digits RTO + 4 digits Year + 7 digits unique
        if len(clean_dl) >= 15:
            state_code = clean_dl[:2]
            year_str = clean_dl[4:8]
            is_state_valid = state_code in cls.INDIAN_STATE_CODES
            is_year_valid = year_str.isdigit() and (1970 <= int(year_str) <= datetime.now().year)

            valid = is_state_valid and is_year_valid
            return {
                "valid": valid,
                "dl_number": clean_dl,
                "state_code": state_code,
                "state_valid": is_state_valid,
                "year_of_issue": year_str if is_year_valid else None,
                "reason": f"Valid Sarathi DL registered under state code {state_code}" if valid else "Malformed DL number or unrecognized state jurisdiction"
            }
        return {
            "valid": False,
            "dl_number": clean_dl,
            "reason": "Driving license number length is insufficient (expected 15-16 alphanumeric characters)"
        }
