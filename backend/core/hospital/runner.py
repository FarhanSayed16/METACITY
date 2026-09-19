from dataclasses import dataclass
from .resources import HospitalResources
from .triage import TriageQueue
from .flow import PatientFlowModel
import random

@dataclass
class HospitalResult:
    total_arrived: int
    total_treated: int
    peak_queue_length: int
    avg_queue_length: float

def run_hospital_surge(
    beds: int = 100, 
    nurses: int = 50, 
    surge_rate_per_tick: float = 2.0, 
    max_ticks: int = 1440 # 24 hours in minutes
) -> HospitalResult:
    """
    Main loop for hospital DES.
    """
    resources = HospitalResources(
        total_beds=beds, available_beds=beds,
        total_doctors=beds//4, available_doctors=beds//4,
        total_nurses=nurses, available_nurses=nurses,
        total_ors=beds//10, available_ors=beds//10
    )
    
    triage = TriageQueue()
    flow = PatientFlowModel(resources, triage)
    
    total_arrived = 0
    total_treated = 0
    queue_lengths = []
    
    for tick in range(max_ticks):
        # Poisson arrival
        arrivals = 0
        while random.random() < (surge_rate_per_tick / (arrivals + 1)):
            arrivals += 1
            
        if arrivals > 0:
            flow.admit_arrivals(arrivals, tick)
            total_arrived += arrivals
            
        queue_lengths.append(len(triage))
        
        # Process 1 minute
        flow.process_step(dt=1.0)
        
    total_treated = total_arrived - len(triage) - len(flow.active_patients)
    peak_q = max(queue_lengths) if queue_lengths else 0
    avg_q = sum(queue_lengths) / len(queue_lengths) if queue_lengths else 0.0
    
    return HospitalResult(
        total_arrived=total_arrived,
        total_treated=total_treated,
        peak_queue_length=peak_q,
        avg_queue_length=avg_q
    )
