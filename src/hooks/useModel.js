import { useState, useMemo, useCallback } from 'react'
import { runModel, compareScenarios } from '../model/modelRunner.js'
import { runSensitivityAnalysis } from '../model/sensitivityAnalysis.js'
import { scenarios, defaultScenarioId } from '../data/scenarios.js'

const defaultParams = {
  withU9: false,
  populationGrowth: 0,
  fuelPrice: 1.80,
  oepnvMonthlyPass: 49,
  bikeInfraQuality: 6,
  tripRate: 3.0,
}

export function useModel() {
  const [params, setParams] = useState(defaultParams)
  const [scenarioId, setScenarioId] = useState(defaultScenarioId)

  const result = useMemo(() => runModel(params), [params])

  const baselineResult = useMemo(
    () => runModel({ ...defaultParams, withU9: false }),
    []
  )

  const comparison = useMemo(() => {
    if (!params.withU9) return null
    return compareScenarios(
      { ...params, withU9: false },
      params
    )
  }, [params])

  const sensitivity = useMemo(() => {
    if (!params.withU9) return null
    return runSensitivityAnalysis(params)
  }, [params])

  const updateParam = useCallback((key, value) => {
    setParams((prev) => ({ ...prev, [key]: value }))
  }, [])

  const selectScenario = useCallback((id) => {
    const scenario = scenarios.find((s) => s.id === id)
    if (scenario) {
      setScenarioId(id)
      setParams(scenario.params)
    }
  }, [])

  return {
    params,
    setParams,
    updateParam,
    scenarioId,
    selectScenario,
    result,
    baselineResult,
    comparison,
    sensitivity,
  }
}
