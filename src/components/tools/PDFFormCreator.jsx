"use client";
import React, { useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { PDFDocument, rgb } from "pdf-lib"; // For PDF generation
import { FaDownload, FaTrash, FaPlus, FaFilePdf } from "react-icons/fa";

// Sortable Item Component
const SortableItem = ({ id, field, isSelected, onSelect, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    position: "absolute",
    left: `${field.x}px`,
    top: `${field.y}px`,
    width: `${field.width}px`,
    height: `${field.height}px`,
    fontSize: `${field.fontSize || 12}px`,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(field.id);
      }}
      className={`border-2 p-2 rounded cursor-move flex justify-between items-center ${
        isSelected ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
      }`}
    >
      <span>
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
        {field.type === "checkbox" && " ☑"}
        {field.type === "radio" && " ◯"}
        {field.type === "dropdown" && " ▼"}
        {field.type === "signature" && " ✍"}
      </span>
      {isSelected && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(field.id);
          }}
          className="text-red-500 hover:text-red-700"
        >
          <FaTrash />
        </button>
      )}
    </div>
  );
};

const PDFFormCreator = () => {
  const [formFields, setFormFields] = useState([]);
  const [selectedField, setSelectedField] = useState(null);
  const [formSettings, setFormSettings] = useState({
    title: "Untitled Form",
    pageSize: "A4",
    orientation: "portrait",
    fontSize: 12,
    backgroundColor: "#ffffff",
  });

  const fieldTypes = [
    { id: "text", label: "Text Field", icon: "T" },
    { id: "checkbox", label: "Checkbox", icon: "☑" },
    { id: "radio", label: "Radio Button", icon: "◯" },
    { id: "dropdown", label: "Dropdown", icon: "▼" },
    { id: "signature", label: "Signature", icon: "✍" },
    { id: "date", label: "Date Picker", icon: "📅" },
  ];

  const pageSizes = {
    A4: { width: 595, height: 842 },
    Letter: { width: 612, height: 792 },
    Legal: { width: 612, height: 1008 },
  };

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    if (!over) return;

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
        fontSize: formSettings.fontSize,
      };
      setFormFields((prev) => [...prev, newField]);
    }
  }, [formFields, formSettings.fontSize]);

  const handleFieldUpdate = (id, updates) => {
    setFormFields((prev) =>
      prev.map((field) => (field.id === id ? { ...field, ...updates } : field))
    );
  };

  const handleCanvasClick = (e) => {
    if (selectedField) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width - 200));
      const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height - 40));
      handleFieldUpdate(selectedField, { x, y });
      setSelectedField(null);
    }
  };

  const deleteField = (id) => {
    setFormFields((prev) => prev.filter((field) => field.id !== id));
    if (selectedField === id) setSelectedField(null);
  };

  const downloadPDF = async () => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([
      pageSizes[formSettings.pageSize][formSettings.orientation === "portrait" ? "width" : "height"],
      pageSizes[formSettings.pageSize][formSettings.orientation === "portrait" ? "height" : "width"],
    ]);

    const font = await pdfDoc.embedFont("Helvetica");
    page.setFont(font);
    page.setFontSize(formSettings.fontSize);

    // Draw background
    page.drawRectangle({
      x: 0,
      y: 0,
      width: page.getWidth(),
      height: page.getHeight(),
      color: rgb(
        parseInt(formSettings.backgroundColor.slice(1, 3), 16) / 255,
        parseInt(formSettings.backgroundColor.slice(3, 5), 16) / 255,
        parseInt(formSettings.backgroundColor.slice(5, 7), 16) / 255
      ),
    });

    // Draw title
    page.drawText(formSettings.title, { x: 50, y: page.getHeight() - 50 });

    // Draw fields
    formFields.forEach((field) => {
      page.drawText(field.label, {
        x: field.x,
        y: page.getHeight() - field.y - field.height,
        size: field.fontSize,
        color: rgb(0, 0, 0),
      });
      if (field.required) {
        page.drawText("*", {
          x: field.x + field.width - 10,
          y: page.getHeight() - field.y - field.height,
          size: field.fontSize,
          color: rgb(1, 0, 0),
        });
      }
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${formSettings.title}.pdf`;
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">PDF Form Creator</h1>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Toolbox */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Form Elements</h2>
              <div className="space-y-2">
                {fieldTypes.map((field) => (
                  <div
                    key={field.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", field.id);
                      e.dataTransfer.setData("fromToolbox", "true");
                    }}
                    className="p-2 bg-gray-50 rounded cursor-move hover:bg-gray-100 flex items-center"
                  >
                    <span className="mr-2 text-lg">{field.icon}</span>
                    <span className="text-sm">{field.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Canvas */}
            <div className="md:col-span-2 bg-white p-4 rounded-lg shadow relative">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">{formSettings.title}</h2>
              <div
                onClick={handleCanvasClick}
                onDrop={(e) => {
                  e.preventDefault();
                  const fieldType = e.dataTransfer.getData("text/plain");
                  const fromToolbox = e.dataTransfer.getData("fromToolbox");
                  if (fromToolbox) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width - 200));
                    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height - 40));
                    const newField = {
                      id: `field_${Date.now()}`,
                      type: fieldType,
                      x,
                      y,
                      width: 200,
                      height: 40,
                      label: `${fieldType} Field`,
                      required: false,
                      fontSize: formSettings.fontSize,
                    };
                    setFormFields((prev) => [...prev, newField]);
                  }
                }}
                onDragOver={(e) => e.preventDefault()}
                className="relative border border-gray-200 overflow-hidden"
                style={{
                  width: `${pageSizes[formSettings.pageSize].width}px`,
                  height: `${pageSizes[formSettings.pageSize].height}px`,
                  backgroundColor: formSettings.backgroundColor,
                  transform: formSettings.orientation === "landscape" ? "rotate(90deg)" : "none",
                  transformOrigin: "center center",
                  maxHeight: "80vh",
                }}
              >
                <SortableContext items={formFields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                  {formFields.map((field) => (
                    <SortableItem
                      key={field.id}
                      id={field.id}
                      field={field}
                      isSelected={selectedField === field.id}
                      onSelect={setSelectedField}
                      onDelete={deleteField}
                    />
                  ))}
                </SortableContext>
              </div>
            </div>

            {/* Properties Panel */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Properties</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Form Title</label>
                  <input
                    type="text"
                    value={formSettings.title}
                    onChange={(e) => setFormSettings((prev) => ({ ...prev, title: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Page Size</label>
                  <select
                    value={formSettings.pageSize}
                    onChange={(e) => setFormSettings((prev) => ({ ...prev, pageSize: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="A4">A4 (595 x 842)</option>
                    <option value="Letter">Letter (612 x 792)</option>
                    <option value="Legal">Legal (612 x 1008)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Orientation</label>
                  <select
                    value={formSettings.orientation}
                    onChange={(e) => setFormSettings((prev) => ({ ...prev, orientation: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Default Font Size</label>
                  <input
                    type="number"
                    min="8"
                    max="24"
                    value={formSettings.fontSize}
                    onChange={(e) =>
                      setFormSettings((prev) => ({ ...prev, fontSize: Math.max(8, Math.min(24, e.target.value)) }))
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
                  <input
                    type="color"
                    value={formSettings.backgroundColor}
                    onChange={(e) => setFormSettings((prev) => ({ ...prev, backgroundColor: e.target.value }))}
                    className="w-full h-10 p-1 border border-gray-300 rounded-md cursor-pointer"
                  />
                </div>
              </div>

              {selectedField && (
                <div className="mt-6">
                  <h3 className="text-md font-medium mb-2 text-gray-800">Field Properties</h3>
                  {(() => {
                    const field = formFields.find((f) => f.id === selectedField);
                    return (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                          <input
                            type="text"
                            value={field.label}
                            onChange={(e) => handleFieldUpdate(field.id, { label: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
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
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
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
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Font Size (px)</label>
                          <input
                            type="number"
                            min="8"
                            max="24"
                            value={field.fontSize}
                            onChange={(e) =>
                              handleFieldUpdate(field.id, {
                                fontSize: Math.max(8, Math.min(24, parseInt(e.target.value) || 12)),
                              })
                            }
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
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
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </DndContext>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row justify-end gap-4">
          <button
            onClick={() => {
              setFormFields([]);
              setSelectedField(null);
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center justify-center"
          >
            <FaTrash className="mr-2" /> Clear Form
          </button>
          <button
            onClick={downloadPDF}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center"
          >
            <FaDownload className="mr-2" /> Download PDF
          </button>
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Drag-and-drop form field placement</li>
            <li>Multiple field types including date picker</li>
            <li>Customizable page size, orientation, and background</li>
            <li>Per-field customization (size, font, required)</li>
            <li>PDF generation with pdf-lib</li>
            <li>Responsive design with Tailwind CSS</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PDFFormCreator;