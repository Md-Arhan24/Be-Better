import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import SideBar  from '../app/components/goals/SideBar'

import GoalCreation from '../app/components/goals/GoalCreation'
import RoadMap      from '../app/components/goals/RoadMap'
import CalendarView from '../app/components/goals/CalendarView'
import DailyFocus   from '../app/components/goals/DailyFocus'
import MyGoals from '../app/components/goals/MyGoals'
import RoadmapOverview from '../app/components/goals/RoadMap'
const MainPage = () => {
  const [goalData, setGoalData] = useState(null)

  return (
    <div className="flex min-h-screen bg-[#0A0A0A]">

      {/* Sidebar handles its own navigation via Links */}
      <SideBar />

      {/* Content area — ml-60 pushes it past the fixed sidebar */}
      <main className="flex-1 lg:ml-60 overflow-y-auto">
        <Routes>
          {/* Default → redirect to /main/goals */}
          <Route index element={<Navigate to="goals" replace />} />

         
         
          {/* main/goals */}
            <Route
            path="goals"
            element={<MyGoals goalData={goalData} />}
          />
          <Route
            path="goals/:id"
            element={<RoadmapOverview goalData={goalData} />}
          />
          <Route
            path="calendar"
            element={<CalendarView goalData={goalData} />}
          />
          <Route
            path="progress"
            element={<DailyFocus goalData={goalData} />}
          />
        </Routes>
      </main>

    </div>
  )
}

export default MainPage