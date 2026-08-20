import { useState, useCallback } from 'react';
import { apiClient } from '../api/client';

export function useQCInspection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const submitRollInspection = useCallback(async (rollData, qcMetrics, defects) => {
    setIsSubmitting(true);
    setSubmitError(null);

    const payload = {
      piece_number: rollData.pieceNumber,
      loom_number: rollData.loomNumber,
      sort_number: rollData.sortNumber,
      beam_number: rollData.beamNumber,
      gross_length_meters: Number(rollData.grossLengthMeters),
      width_inches: Number(rollData.widthInches),
      net_weight_kg: Number(rollData.netWeightKg),
      calculated_gsm: Number(qcMetrics.calculatedGsm),
      total_defect_points: qcMetrics.totalPoints,
      points_per_100_sq_meters: qcMetrics.pointsPer100SqM,
      qc_grade: qcMetrics.grade,
      inspector_name: rollData.inspectorName,
      defects: defects.map((d) => ({
        defect_type: d.type,
        meter_location: d.meterLocation,
        points: d.points,
        logged_at_time: d.timestamp,
      })),
    };

    try {
      const response = await apiClient.post('/qc/rolls', payload);
      setIsSubmitting(false);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail || 
        err.message || 
        'Could not connect to local server.';
      setSubmitError(errorMessage);
      setIsSubmitting(false);
      return { success: false, error: errorMessage };
    }
  }, []);

  return {
    submitRollInspection,
    isSubmitting,
    submitError,
    clearError: () => setSubmitError(null),
  };
}