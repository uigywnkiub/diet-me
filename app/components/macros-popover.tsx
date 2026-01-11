'use client'

import React, { useEffect, useState } from 'react'
import {
  BiBookAlt,
  BiCheck,
  BiEditAlt,
  BiTrashAlt,
  BiUndo,
  BiX,
} from 'react-icons/bi'

import { LOCAL_STORAGE_KEY } from '@/constants/local-storage'
import { AnimatePresence, motion } from 'framer-motion'

export default function MacrosPopover() {
  const [isOpen, setIsOpen] = useState(false)
  const [isEditingGoals, setIsEditingGoals] = useState(false)
  const [macrosData, setMacrosData] = useState({
    calories: 0,
    burned: 0,
    protein: 0,
    proteinGoal: 142,
    fat: 0,
    fatGoal: 75,
    carbohydrates: 0,
    carbsGoal: 256,
    totalCalories: 2335,
  })

  const [editGoals, setEditGoals] = useState({
    totalCalories: 2335,
    proteinGoal: 142,
    fatGoal: 75,
    carbsGoal: 256,
  })

  const [history, setHistory] = useState([])
  const hasHistory = history.length > 0
  const remaining = macrosData.totalCalories - macrosData.calories

  // Load data from localStorage on mount
  useEffect(() => {
    const loadData = () => {
      const storedData = localStorage.getItem(LOCAL_STORAGE_KEY.MACROS_DATA)
      if (storedData) {
        const parsed = JSON.parse(storedData)
        setMacrosData({
          calories: parsed.calories || 0,
          burned: 0,
          protein: parsed.protein || 0,
          proteinGoal: parsed.proteinGoal || 142,
          fat: parsed.fat || 0,
          fatGoal: parsed.fatGoal || 75,
          carbohydrates: parsed.carbohydrates || 0,
          carbsGoal: parsed.carbsGoal || 256,
          totalCalories: parsed.totalCalories || 2335,
        })
        setEditGoals({
          totalCalories: parsed.totalCalories || 2335,
          proteinGoal: parsed.proteinGoal || 142,
          fatGoal: parsed.fatGoal || 75,
          carbsGoal: parsed.carbsGoal || 256,
        })
      }

      // Load history
      const storedHistory = localStorage.getItem(
        LOCAL_STORAGE_KEY.MACROS_HISTORY,
      )
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory))
      }
    }

    loadData()
  }, [])

  // Listen for storage changes (when food is analyzed)
  useEffect(() => {
    // @ts-ignore
    const onStorageChange = (e) => {
      // Handle both storage event and custom event
      if (
        e.type === 'storage' &&
        e.key !== LOCAL_STORAGE_KEY.MACROS_DATA &&
        e.key !== LOCAL_STORAGE_KEY.MACROS_HISTORY
      )
        return

      const storedData = localStorage.getItem(LOCAL_STORAGE_KEY.MACROS_DATA)
      if (storedData) {
        const parsed = JSON.parse(storedData)
        setMacrosData((prev) => ({
          ...prev,
          calories: parsed.calories || 0,
          protein: parsed.protein || 0,
          fat: parsed.fat || 0,
          carbohydrates: parsed.carbohydrates || 0,
          proteinGoal: parsed.proteinGoal || prev.proteinGoal,
          fatGoal: parsed.fatGoal || prev.fatGoal,
          carbsGoal: parsed.carbsGoal || prev.carbsGoal,
          totalCalories: parsed.totalCalories || prev.totalCalories,
        }))
      }

      const storedHistory = localStorage.getItem(
        LOCAL_STORAGE_KEY.MACROS_HISTORY,
      )
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory))
      }
    }

    // Listen for storage events (cross-tab)
    window.addEventListener('storage', onStorageChange)

    // Listen for custom event (same-tab updates)
    window.addEventListener('macrosUpdated', onStorageChange)

    // Polling as fallback (checks every 500ms)
    const interval = setInterval(() => {
      const storedData = localStorage.getItem(LOCAL_STORAGE_KEY.MACROS_DATA)
      if (storedData) {
        const parsed = JSON.parse(storedData)
        setMacrosData((prev) => {
          // Only update if data actually changed
          if (
            prev.calories !== parsed.calories ||
            prev.protein !== parsed.protein ||
            prev.fat !== parsed.fat ||
            prev.carbohydrates !== parsed.carbohydrates
          ) {
            return {
              ...prev,
              calories: parsed.calories || 0,
              protein: parsed.protein || 0,
              fat: parsed.fat || 0,
              carbohydrates: parsed.carbohydrates || 0,
              proteinGoal: parsed.proteinGoal || prev.proteinGoal,
              fatGoal: parsed.fatGoal || prev.fatGoal,
              carbsGoal: parsed.carbsGoal || prev.carbsGoal,
              totalCalories: parsed.totalCalories || prev.totalCalories,
            }
          }
          return prev
        })
      }

      const storedHistory = localStorage.getItem(
        LOCAL_STORAGE_KEY.MACROS_HISTORY,
      )
      if (storedHistory) {
        const newHistory = JSON.parse(storedHistory)
        setHistory((prev) => {
          if (JSON.stringify(prev) !== JSON.stringify(newHistory)) {
            return newHistory
          }
          return prev
        })
      }
    }, 500)

    return () => {
      window.removeEventListener('storage', onStorageChange)
      window.removeEventListener('macrosUpdated', onStorageChange)
      clearInterval(interval)
    }
  }, [])

  const getProgressPercentage = (current: number, goal: number): number => {
    return Math.min((current / goal) * 100, 100)
  }

  const onClearData = () => {
    const defaultData = {
      calories: 0,
      protein: 0,
      fat: 0,
      carbohydrates: 0,
      proteinGoal: macrosData.proteinGoal,
      fatGoal: macrosData.fatGoal,
      carbsGoal: macrosData.carbsGoal,
      totalCalories: macrosData.totalCalories,
    }
    localStorage.setItem(
      LOCAL_STORAGE_KEY.MACROS_DATA,
      JSON.stringify(defaultData),
    )
    localStorage.removeItem(LOCAL_STORAGE_KEY.MACROS_HISTORY)
    setMacrosData((prev) => ({
      ...prev,
      calories: 0,
      protein: 0,
      fat: 0,
      carbohydrates: 0,
    }))
    setHistory([])
    window.dispatchEvent(new Event('macrosUpdated'))
  }

  const onSaveGoals = () => {
    const updatedData = {
      calories: macrosData.calories,
      protein: macrosData.protein,
      fat: macrosData.fat,
      carbohydrates: macrosData.carbohydrates,
      totalCalories: Number(editGoals.totalCalories),
      proteinGoal: Number(editGoals.proteinGoal),
      fatGoal: Number(editGoals.fatGoal),
      carbsGoal: Number(editGoals.carbsGoal),
    }

    localStorage.setItem(
      LOCAL_STORAGE_KEY.MACROS_DATA,
      JSON.stringify(updatedData),
    )
    setMacrosData((prev) => ({
      ...prev,
      totalCalories: Number(editGoals.totalCalories),
      proteinGoal: Number(editGoals.proteinGoal),
      fatGoal: Number(editGoals.fatGoal),
      carbsGoal: Number(editGoals.carbsGoal),
    }))
    setIsEditingGoals(false)
  }

  const onCancelEdit = () => {
    setEditGoals({
      totalCalories: macrosData.totalCalories,
      proteinGoal: macrosData.proteinGoal,
      fatGoal: macrosData.fatGoal,
      carbsGoal: macrosData.carbsGoal,
    })
    setIsEditingGoals(false)
  }

  const onRevertLast = () => {
    if (history.length === 0) return

    // Get the last entry from history
    const lastEntry = history[history.length - 1]

    // Subtract the last entry from current data
    const updatedData = {
      // @ts-ignore
      calories: Math.max(0, macrosData.calories - lastEntry.calories),
      // @ts-ignore
      protein: Math.max(0, macrosData.protein - lastEntry.protein),
      // @ts-ignore
      fat: Math.max(0, macrosData.fat - lastEntry.fat),
      carbohydrates: Math.max(
        0,
        // @ts-ignore
        macrosData.carbohydrates - lastEntry.carbohydrates,
      ),
      proteinGoal: macrosData.proteinGoal,
      fatGoal: macrosData.fatGoal,
      carbsGoal: macrosData.carbsGoal,
      totalCalories: macrosData.totalCalories,
    }

    // Remove last entry from history
    const newHistory = history.slice(0, -1)

    localStorage.setItem(
      LOCAL_STORAGE_KEY.MACROS_DATA,
      JSON.stringify(updatedData),
    )
    localStorage.setItem(
      LOCAL_STORAGE_KEY.MACROS_HISTORY,
      JSON.stringify(newHistory),
    )

    setMacrosData((prev) => ({
      ...prev,
      calories: updatedData.calories,
      protein: updatedData.protein,
      fat: updatedData.fat,
      carbohydrates: updatedData.carbohydrates,
    }))
    setHistory(newHistory)
    window.dispatchEvent(new Event('macrosUpdated'))
  }

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => setIsOpen(!isOpen)}
        className='fixed right-4 top-4 z-50 rounded-full bg-white p-3 shadow-lg transition-shadow hover:shadow-xl md:right-10 md:top-10'
      >
        <BiBookAlt className='fill-gray-600 text-2xl' />
      </motion.button>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className='fixed inset-0 z-40 bg-black/30 backdrop-blur-sm'
          />
        )}
      </AnimatePresence>

      {/* Popover Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className='fixed right-4 top-20 z-50 w-[91.5vw] max-w-2xl md:right-10 md:top-24 md:w-[60vw] lg:w-[30vw]'
          >
            <div className='rounded-3xl bg-white p-4 shadow-2xl md:p-6 dark:bg-gray-800'>
              {/* Header with Buttons */}
              <div className='mb-4 flex items-center justify-between md:mb-6'>
                <h3 className='text-xl font-extrabold text-gray-900 md:text-2xl dark:text-white'>
                  Today&apos;s Summary
                </h3>
                {/* <h2 className='text-xl font-extrabold text-gray-900 dark:text-white md:text-2xl'>🔥1</h2> */}
                <div className='flex items-center gap-2'>
                  {isEditingGoals ? (
                    <>
                      <button
                        onClick={onSaveGoals}
                        className='rounded-full p-2 transition-colors hover:bg-green-50 dark:hover:bg-green-900/30'
                        title='Save goals'
                      >
                        <BiCheck className='fill-green-600 text-2xl' />
                      </button>
                      <button
                        onClick={onCancelEdit}
                        className='rounded-full p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-900/30'
                        title='Cancel'
                      >
                        <BiX className='fill-gray-600 text-2xl dark:fill-gray-400' />
                      </button>
                    </>
                  ) : (
                    <>
                      {hasHistory && (
                        <button
                          onClick={onRevertLast}
                          className='rounded-full p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-900/30'
                          title='Revert last analyzed food'
                        >
                          <BiUndo className='fill-gray-600 text-lg md:text-xl dark:fill-gray-400' />
                        </button>
                      )}
                      <button
                        onClick={() => setIsEditingGoals(true)}
                        className='rounded-full p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-900/30'
                        title='Edit goals'
                      >
                        <BiEditAlt className='fill-gray-600 text-lg md:text-xl dark:fill-gray-400' />
                      </button>
                      {macrosData.calories > 0 && (
                        <button
                          onClick={onClearData}
                          className='rounded-full p-2 transition-colors hover:bg-red-50 dark:hover:bg-red-900/30'
                          title='Clear all data'
                        >
                          <BiTrashAlt className='fill-red-600 text-lg md:text-xl dark:fill-red-400' />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Circular Progress */}
              <div className='mb-6 flex items-center justify-around md:mb-8'>
                <div className='text-center'>
                  <div
                    className={`text-2xl font-bold md:text-3xl ${macrosData.calories > macrosData.totalCalories ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}
                  >
                    {Math.round(macrosData.calories)}
                  </div>
                  <div className='mt-1 text-xs text-gray-500 md:text-sm dark:text-gray-400'>
                    Eaten
                  </div>
                </div>

                <div className='relative'>
                  <svg className='h-32 w-32 -rotate-90 transform md:h-40 md:w-40'>
                    <circle
                      cx='64'
                      cy='64'
                      r='56'
                      stroke='currentColor'
                      strokeWidth='8'
                      fill='none'
                      className='text-gray-200 md:hidden dark:text-gray-600'
                    />
                    <circle
                      cx='80'
                      cy='80'
                      r='70'
                      stroke='currentColor'
                      strokeWidth='10'
                      fill='none'
                      className='hidden text-gray-200 md:block dark:text-gray-600'
                    />
                    <circle
                      cx='64'
                      cy='64'
                      r='56'
                      stroke={
                        macrosData.calories > macrosData.totalCalories
                          ? '#ef4444'
                          : '#10b981'
                      }
                      strokeWidth='8'
                      fill='none'
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${2 * Math.PI * 56 * Math.max(0, 1 - macrosData.calories / macrosData.totalCalories)}`}
                      strokeLinecap='round'
                      className='transition-all duration-500 md:hidden'
                    />
                    <circle
                      cx='80'
                      cy='80'
                      r='70'
                      stroke={
                        macrosData.calories > macrosData.totalCalories
                          ? '#ef4444'
                          : '#10b981'
                      }
                      strokeWidth='10'
                      fill='none'
                      strokeDasharray={`${2 * Math.PI * 70}`}
                      strokeDashoffset={`${2 * Math.PI * 70 * Math.max(0, 1 - macrosData.calories / macrosData.totalCalories)}`}
                      strokeLinecap='round'
                      className='hidden transition-all duration-500 md:block'
                    />
                  </svg>
                  <div className='absolute inset-0 flex flex-col items-center justify-center'>
                    <div
                      className={`text-3xl font-extrabold md:text-4xl ${remaining < 0 ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}
                    >
                      {Math.abs(Math.round(remaining)).toLocaleString()}
                    </div>
                    <div className='mt-1 text-xs text-gray-500 md:text-sm dark:text-gray-400'>
                      {remaining < 0 ? 'Over' : 'Remaining'}
                    </div>
                    {isEditingGoals && (
                      <div className='mt-2 flex items-center gap-1 font-semibold'>
                        <input
                          type='number'
                          value={editGoals.totalCalories}
                          onChange={(e) =>
                            setEditGoals((prev) => ({
                              ...prev,
                              totalCalories: Number(e.target.value),
                            }))
                          }
                          className='w-16 rounded bg-gray-100 px-2 py-1 text-xs focus:outline-none dark:bg-gray-900'
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className='text-center'>
                  <div className='text-2xl font-bold text-gray-900 md:text-3xl dark:text-white'>
                    {macrosData.burned}
                  </div>
                  <div className='mt-1 text-xs text-gray-500 md:text-sm dark:text-gray-400'>
                    Burned
                  </div>
                </div>
              </div>

              {/* Macros Progress Bars */}
              <div className='space-y-4 md:space-y-5'>
                <div>
                  <div className='mb-2 flex items-center justify-between'>
                    <span className='text-xs text-gray-500 md:text-sm dark:text-gray-400'>
                      Carbs
                    </span>
                  </div>
                  <div className='relative h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-600'>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${getProgressPercentage(macrosData.carbohydrates, macrosData.carbsGoal)}%`,
                      }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className={`absolute h-full rounded-full ${
                        macrosData.carbohydrates > macrosData.carbsGoal
                          ? 'bg-red-500'
                          : 'bg-[#10b981]'
                      }`}
                    />
                  </div>
                  <div
                    className={`font- mt-2 flex items-center gap-1 text-xs font-semibold text-gray-900 md:text-sm dark:text-white ${
                      macrosData.carbohydrates > macrosData.carbsGoal
                        ? 'text-red-500'
                        : 'text-gray-600 dark:text-gray-200'
                    }`}
                  >
                    <span>{Math.round(macrosData.carbohydrates)} /</span>
                    {isEditingGoals ? (
                      <input
                        type='number'
                        value={editGoals.carbsGoal}
                        onChange={(e) =>
                          setEditGoals((prev) => ({
                            ...prev,
                            carbsGoal: Number(e.target.value),
                          }))
                        }
                        className='w-16 rounded bg-gray-100 px-2 py-1 focus:outline-none dark:bg-gray-900'
                      />
                    ) : (
                      <span>{macrosData.carbsGoal}</span>
                    )}
                    <span>g</span>
                  </div>
                </div>

                {/* Protein */}
                <div>
                  <div className='mb-2 flex items-center justify-between'>
                    <span className='text-xs text-gray-500 md:text-sm dark:text-gray-400'>
                      Protein
                    </span>
                  </div>
                  <div className='relative h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-600'>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${getProgressPercentage(macrosData.protein, macrosData.proteinGoal)}%`,
                      }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className={`absolute h-full rounded-full ${
                        macrosData.protein > macrosData.proteinGoal
                          ? 'bg-red-500'
                          : 'bg-[#10b981]'
                      }`}
                    />
                  </div>
                  <div
                    className={`mt-2 flex items-center gap-1 text-xs font-semibold text-gray-900 md:text-sm dark:text-white ${
                      macrosData.protein > macrosData.proteinGoal
                        ? 'text-red-500'
                        : 'text-gray-600 dark:text-gray-200'
                    }`}
                  >
                    <span>{Math.round(macrosData.protein)} /</span>
                    {isEditingGoals ? (
                      <input
                        type='number'
                        value={editGoals.proteinGoal}
                        onChange={(e) =>
                          setEditGoals((prev) => ({
                            ...prev,
                            proteinGoal: Number(e.target.value),
                          }))
                        }
                        className='w-16 rounded bg-gray-100 px-2 py-1 focus:outline-none dark:bg-gray-900'
                      />
                    ) : (
                      <span>{macrosData.proteinGoal}</span>
                    )}
                    <span>g</span>
                  </div>
                </div>

                {/* Fat */}
                <div>
                  <div className='mb-2 flex items-center justify-between'>
                    <span className='text-xs text-gray-500 md:text-sm dark:text-gray-400'>
                      Fat
                    </span>
                  </div>
                  <div className='relative h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-600'>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${getProgressPercentage(macrosData.fat, macrosData.fatGoal)}%`,
                      }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className={`absolute h-full rounded-full ${
                        macrosData.fat > macrosData.fatGoal
                          ? 'bg-red-500'
                          : 'bg-[#10b981]'
                      }`}
                    />
                  </div>
                  <div
                    className={`mt-2 flex items-center gap-1 text-xs font-semibold text-gray-900 md:text-sm dark:text-white ${
                      macrosData.fat > macrosData.fatGoal
                        ? 'text-red-500'
                        : 'text-gray-600 dark:text-gray-200'
                    }`}
                  >
                    <span>{Math.round(macrosData.fat)} /</span>
                    {isEditingGoals ? (
                      <input
                        type='number'
                        value={editGoals.fatGoal}
                        onChange={(e) =>
                          setEditGoals((prev) => ({
                            ...prev,
                            fatGoal: Number(e.target.value),
                          }))
                        }
                        className='w-16 rounded bg-gray-100 px-2 py-1 focus:outline-none dark:bg-gray-900'
                      />
                    ) : (
                      <span>{macrosData.fatGoal}</span>
                    )}
                    <span>g</span>
                  </div>
                </div>
              </div>

              <div className='mt-8 text-center text-xs text-gray-500 dark:text-gray-400'>
                The data updates automatically when you analyze food.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
