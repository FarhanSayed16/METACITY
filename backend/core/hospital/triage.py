from dataclasses import dataclass
from typing import Optional

@dataclass
class Patient:
    id: int
    # 1: Resuscitation, 2: Emergent, 3: Urgent, 4: Less Urgent, 5: Non-Urgent
    triage_level: int 
    arrival_time: float
    state: str = "arrived" # arrived, triaged, waiting_bed, in_treatment, discharged, admitted, deceased
    treatment_time_remaining: float = 0.0

class TriageQueue:
    """
    Priority queue for patients based on severity.
    """
    def __init__(self):
        # We'll use 5 queues, one for each severity level (1 is highest priority)
        self.queues: dict[int, list[Patient]] = {1: [], 2: [], 3: [], 4: [], 5: []}
        
    def add_patient(self, patient: Patient):
        self.queues[patient.triage_level].append(patient)
        
    def get_next_patient(self) -> Optional[Patient]:
        """Gets highest priority patient."""
        for level in range(1, 6):
            if self.queues[level]:
                return self.queues[level].pop(0)
        return None
        
    def __len__(self) -> int:
        return sum(len(q) for q in self.queues.values())
