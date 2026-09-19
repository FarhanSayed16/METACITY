from .resources import HospitalResources
from .triage import TriageQueue, Patient
import random

class PatientFlowModel:
    """
    Handles the state machine of patients moving through the hospital.
    """
    def __init__(self, resources: HospitalResources, triage: TriageQueue):
        self.resources = resources
        self.triage = triage
        self.active_patients: list[Patient] = []
        
    def admit_arrivals(self, num_arrivals: int, current_time: float):
        for _ in range(num_arrivals):
            # Random triage distribution (skewed towards 3-4 normally, but maybe 1-2 in disaster)
            level = random.choices([1, 2, 3, 4, 5], weights=[5, 15, 40, 30, 10])[0]
            p = Patient(
                id=random.randint(1000, 999999),
                triage_level=level,
                arrival_time=current_time
            )
            p.state = "triaged"
            self.triage.add_patient(p)
            
    def process_step(self, dt: float = 1.0):
        # 1. Move patients from triage to beds if available
        while self.resources.available_beds > 0 and self.resources.available_nurses > 0:
            p = self.triage.get_next_patient()
            if not p:
                break
                
            self.resources.acquire_bed()
            self.resources.acquire_nurse()
            p.state = "in_treatment"
            # Random treatment time based on severity
            p.treatment_time_remaining = max(1.0, (6 - p.triage_level) * random.uniform(0.5, 2.0))
            self.active_patients.append(p)
            
        # 2. Process active treatments
        completed = []
        for p in self.active_patients:
            p.treatment_time_remaining -= dt
            if p.treatment_time_remaining <= 0:
                completed.append(p)
                
        # 3. Discharge patients and free resources
        for p in completed:
            self.active_patients.remove(p)
            p.state = "discharged"
            self.resources.release_bed()
            self.resources.release_nurse()
