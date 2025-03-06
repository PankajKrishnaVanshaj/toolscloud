// app/components/PDFFormCreator.jsx
'use client'
import React, { useState } from 'react'
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// Sortable Item Component
const SortableItem = ({ id, field, isSelected, onSelect, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    position: 'absolute',
    left: `${field.x}px`,
    top: `${field.y}px`,
    width: `${field.width}px`,
    height: `${field.height}px`,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(field.id)
      }}
      className={`border-2 p-2 rounded cursor-move ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
      }`}
    >
      {children}
    </div>
  )
}

const PDFFormCreator = () => {
  const [formFields, setFormFields] = useState([])
  const [selectedField, setSelectedField] = useState(null)
  const [formSettings, setFormSettings] = useState({
    title: 'Untitled Form',
    pageSize: 'A4',
    orientation: 'portrait',
    fontSize: 12,
  })

  const fieldTypes = [
    { id: 'text', label: 'Text Field', icon: 'T' },
    { id: 'checkbox', label: 'Checkbox', icon: '☑' },
    { id: 'radio', label: 'Radio Button', icon: '◯' },
    { id: 'dropdown', label: 'Dropdown', icon: '▼' },
    { id: 'signature', label: 'Signature', icon: '✍' },
  ]

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  )

  const handleDragEnd = (event) => {
    const { active, over } = event

    if (!over) return

    if (active.data.current?.fromToolbox) {
      const newField = {
        id: `field_${Date.now()}`,
        type: active.id,
        x: 50,
        y: formFields.length * 50,
        width: 200,
        height: 40,
        label: `${active.id} Field`,
        required: false,
      }
      setFormFields((prev) => [...prev, newField])
    } else if (active.id !== over.id) {
      const oldIndex = formFields.findIndex((f) => f.id === active.id)
      const newIndex = formFields.findIndex((f) => f.id === over.id)
      const newFields = Array.from(formFields)
      const [movedField] = newFields.splice(oldIndex, 1)
      newFields.splice(newIndex, 0, movedField)
      setFormFields(newFields)
    }
  }

  const handleFieldUpdate = (id, updates) => {
    setFormFields((prev) =>
      prev.map((field) => (field.id === id ? { ...field, ...updates } : field))
    )
  }

  const handleCanvasClick = (e) => {
    if (selectedField) {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width - 200))
      const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height - 40))
      handleFieldUpdate(selectedField, { x, y })
      setSelectedField(null)
    }
  }

  const downloadPDF = () => {
    console.log('Generating PDF with fields:', formFields)
    alert('PDF generation preview - check console for field data')
    // Add pdf-lib implementation here if desired
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">PDF Form Creator</h1>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Toolbox */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Form Elements</h2>
              <div className="space-y-2">
                {fieldTypes.map((field) => (
                  <div
                    key={field.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', field.id)
                      e.dataTransfer.setData('fromToolbox', 'true')
                    }}
                    className="p-2 bg-white rounded cursor-move hover:bg-gray-100"
                  >
                    <span className="mr-2">{field.icon}</span>
                    {field.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Canvas */}
            <div className="md:col-span-2 bg-white p-4 rounded-lg shadow relative">
              <h2 className="text-lg font-semibold mb-4">{formSettings.title}</h2>
              <div
                onClick={handleCanvasClick}
                onDrop={(e) => {
                  e.preventDefault()
                  const fieldType = e.dataTransfer.getData('text/plain')
                  const fromToolbox = e.dataTransfer.getData('fromToolbox')
                  if (fromToolbox) {
                    const rect = e.currentTarget.getBoundingClientRect()
                    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width - 200))
                    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height - 40))
                    const newField = {
                      id: `field_${Date.now()}`,
                      type: fieldType,
                      x,
                      y,
                      width: 200,
                      height: 40,
                      label: `${fieldType} Field`,
                      required: false,
                    }
                    setFormFields((prev) => [...prev, newField])
                  }
                }}
                onDragOver={(e) => e.preventDefault()}
                className="h-[842px] w-[595px] bg-white border border-gray-200 relative overflow-hidden"
                style={{
                  transform: formSettings.orientation === 'landscape' ? 'rotate(90deg)' : 'none',
                  transformOrigin: 'center center',
                }}
              >
                <SortableContext
                  items={formFields.map((f) => f.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {formFields.map((field) => (
                    <SortableItem
                      key={field.id}
                      id={field.id}
                      field={field}
                      isSelected={selectedField === field.id}
                      onSelect={setSelectedField}
                    >
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                      {field.type === 'checkbox' && ' ☑'}
                      {field.type === 'radio' && ' ◯'}
                      {field.type === 'dropdown' && ' ▼'}
                      {field.type === 'signature' && ' ✍'}
                    </SortableItem>
                  ))}
                </SortableContext>
              </div>
            </div>

            {/* Properties Panel */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Properties</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Form Title</label>
                  <input
                    type="text"
                    value={formSettings.title}
                    onChange={(e) => setFormSettings((prev) => ({ ...prev, title: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Page Size</label>
                  <select
                    value={formSettings.pageSize}
                    onChange={(e) => setFormSettings((prev) => ({ ...prev, pageSize: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="A4">A4</option>
                    <option value="Letter">Letter</option>
                    <option value="Legal">Legal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Orientation</label>
                  <select
                    value={formSettings.orientation}
                    onChange={(e) => setFormSettings((prev) => ({ ...prev, orientation: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                  </select>
                </div>
              </div>
              {selectedField && (
                <div className="mt-6">
                  <h3 className="text-md font-medium mb-2 text-gray-800">Field Properties</h3>
                  {(() => {
                    const field = formFields.find((f) => f.id === selectedField)
                    return (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                          <input
                            type="text"
                            value={field.label}
                            onChange={(e) => handleFieldUpdate(field.id, { label: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Width (px)</label>
                          <input
                            type="number"
                            value={field.width}
                            onChange={(e) =>
                              handleFieldUpdate(field.id, { width: Math.max(50, parseInt(e.target.value) || 200) })
                            }
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Height (px)</label>
                          <input
                            type="number"
                            value={field.height}
                            onChange={(e) =>
                              handleFieldUpdate(field.id, { height: Math.max(20, parseInt(e.target.value) || 40) })
                            }
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => handleFieldUpdate(field.id, { required: e.target.checked })}
                            className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">Required</span>
                        </label>
                      </div>
                    )
                  })()}
                </div>
              )}
            </div>
          </div>
        </DndContext>

        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={() => {
              setFormFields([])
              setSelectedField(null)
            }}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Clear Form
          </button>
          <button
            onClick={downloadPDF}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Download PDF
          </button>
        </div>
      </div>
    </div>
  )
}

export default PDFFormCreator