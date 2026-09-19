from dataclasses import dataclass

@dataclass
class HospitalResources:
    """
    Tracks hospital capacity and personnel.
    """
    total_beds: int
    available_beds: int
    
    total_doctors: int
    available_doctors: int
    
    total_nurses: int
    available_nurses: int
    
    total_ors: int  # Operating rooms
    available_ors: int
    
    def acquire_bed(self) -> bool:
        if self.available_beds > 0:
            self.available_beds -= 1
            return True
        return False
        
    def release_bed(self):
        self.available_beds = min(self.total_beds, self.available_beds + 1)
        
    def acquire_doctor(self) -> bool:
        if self.available_doctors > 0:
            self.available_doctors -= 1
            return True
        return False
        
    def release_doctor(self):
        self.available_doctors = min(self.total_doctors, self.available_doctors + 1)
        
    def acquire_nurse(self) -> bool:
        if self.available_nurses > 0:
            self.available_nurses -= 1
            return True
        return False
        
    def release_nurse(self):
        self.available_nurses = min(self.total_nurses, self.available_nurses + 1)
