"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { Input, Select, Button, Badge, Textarea, Checkbox, RadioGroup } from "@/components/ui/FormElements";
import { Modal } from "@/components/ui/Modal";

export default function FormElementsView() {
  const [inputValue, setInputValue] = useState("");
  const [dateValue, setDateValue] = useState("");
  const [timeValue, setTimeValue] = useState("");
  const [selectValue, setSelectValue] = useState("option1");
  const [textareaValue, setTextareaValue] = useState("");
  const [checkboxValue, setCheckboxValue] = useState(false);
  const [radioValue, setRadioValue] = useState("option1");
  const [showSmModal, setShowSmModal] = useState(false);
  const [showMdModal, setShowMdModal] = useState(false);
  const [showLgModal, setShowLgModal] = useState(false);
  const [showXlModal, setShowXlModal] = useState(false);
  const [showFullModal, setShowFullModal] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  return (
    <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8">
      {/* Header */}
      <div className="mb-12">
        <h1
          className="text-4xl font-bold mb-2"
          style={{ color: "rgb(var(--text-primary))", fontFamily: "var(--font-display)" }}
        >
          Form Elements
        </h1>
        <p className="text-lg" style={{ color: "rgb(var(--text-secondary))" }}>
          Complete library of reusable form components
        </p>
      </div>

      {/* Input Component */}
      <div
        className="rounded-2xl border p-8 mb-8"
        style={{
          background: "rgb(var(--card))",
          border: "1px solid rgb(var(--border))",
        }}
      >
        <h2
          className="text-2xl font-bold mb-6"
          style={{ color: "rgb(var(--text-primary))", fontFamily: "var(--font-display)" }}
        >
          Input
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <Input
              label="Default Input"
              type="text"
              placeholder="Enter some text..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </div>
          <div>
            <Input
              label="Input with Error"
              type="email"
              placeholder="Enter email..."
              error="This field is required"
            />
          </div>
          <div>
            <Input
              label="Input with Value"
              type="text"
              value="John Doe"
              disabled
            />
          </div>
          <div>
            <Input
              label="Password Input"
              type="password"
              placeholder="Enter password..."
            />
          </div>
          <div>
            <Input
              label="Select Date"
              type="date"
              value={dateValue}
              onChange={(e) => setDateValue(e.target.value)}
            />
          </div>
          <div>
            <Input
              label="Select Time"
              type="time"
              value={timeValue}
              onChange={(e) => setTimeValue(e.target.value)}
            />
          </div>
        </div>
        <p className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
          <strong>Features:</strong> Focus state with brand color border, error handling with red border, disabled state support, custom placeholder styling, native date & time pickers
        </p>
      </div>

      {/* Select Component */}
      <div
        className="rounded-2xl border p-8 mb-8"
        style={{
          background: "rgb(var(--card))",
          border: "1px solid rgb(var(--border))",
        }}
      >
        <h2
          className="text-2xl font-bold mb-6"
          style={{ color: "rgb(var(--text-primary))", fontFamily: "var(--font-display)" }}
        >
          Select
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <Select
              label="Choose Option"
              value={selectValue}
              onChange={(e) => setSelectValue(e.target.value)}
              options={[
                { value: "option1", label: "Option 1" },
                { value: "option2", label: "Option 2" },
                { value: "option3", label: "Option 3" },
              ]}
            />
          </div>
          <div>
            <Select
              label="With Error"
              error="Please select an option"
              options={[
                { value: "", label: "Select..." },
                { value: "opt1", label: "Option 1" },
                { value: "opt2", label: "Option 2" },
              ]}
            />
          </div>
        </div>
        <p className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
          <strong>Features:</strong> Custom styling, focus states, error state, responsive options mapping
        </p>
      </div>

      {/* Textarea Component */}
      <div
        className="rounded-2xl border p-8 mb-8"
        style={{
          background: "rgb(var(--card))",
          border: "1px solid rgb(var(--border))",
        }}
      >
        <h2
          className="text-2xl font-bold mb-6"
          style={{ color: "rgb(var(--text-primary))", fontFamily: "var(--font-display)" }}
        >
          Textarea
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <Textarea
              label="Message"
              placeholder="Enter your message here..."
              value={textareaValue}
              onChange={(e) => setTextareaValue(e.target.value)}
            />
          </div>
          <div>
            <Textarea
              label="With Error"
              placeholder="This field has an error..."
              error="Message is required"
            />
          </div>
        </div>
        <p className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
          <strong>Features:</strong> Resizable, minimum height 120px, focus state with brand color, smooth transitions
        </p>
      </div>

      {/* Checkbox Component */}
      <div
        className="rounded-2xl border p-8 mb-8"
        style={{
          background: "rgb(var(--card))",
          border: "1px solid rgb(var(--border))",
        }}
      >
        <h2
          className="text-2xl font-bold mb-6"
          style={{ color: "rgb(var(--text-primary))", fontFamily: "var(--font-display)" }}
        >
          Checkbox
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <Checkbox
              label="Accept Terms & Conditions"
              description="I agree to the terms and conditions"
              checked={checkboxValue}
              onChange={(e) => setCheckboxValue(e.target.checked)}
            />
          </div>
          <div>
            <Checkbox
              label="Subscribe to Newsletter"
              description="Get updates about new features"
              defaultChecked
            />
          </div>
          <div>
            <Checkbox
              label="Disabled Checkbox"
              description="This checkbox is disabled"
              disabled
            />
          </div>
          <div>
            <Checkbox
              label="Disabled & Checked"
              description="This checkbox is disabled and checked"
              disabled
              defaultChecked
            />
          </div>
        </div>
        <p className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
          <strong>Features:</strong> Custom styling with SVG checkmark, disabled state, label with description, smooth transitions
        </p>
      </div>

      {/* Multi Checkbox Component */}
      <div
        className="rounded-2xl border p-8 mb-8"
        style={{
          background: "rgb(var(--card))",
          border: "1px solid rgb(var(--border))",
        }}
      >
        <h2
          className="text-2xl font-bold mb-6"
          style={{ color: "rgb(var(--text-primary))", fontFamily: "var(--font-display)" }}
        >
          Multi Checkbox
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <p className="text-sm font-semibold mb-3" style={{ color: "rgb(var(--text-primary))" }}>
              Select your interests
            </p>
            <div className="space-y-3">
              {["Technology", "Sports", "Music", "Art", "Science"].map((item) => (
                <Checkbox
                  key={item}
                  label={item}
                  checked={selectedInterests.includes(item)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedInterests([...selectedInterests, item]);
                    } else {
                      setSelectedInterests(selectedInterests.filter((i) => i !== item));
                    }
                  }}
                />
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold mb-3" style={{ color: "rgb(var(--text-primary))" }}>
              Selected: {selectedInterests.length > 0 ? selectedInterests.join(", ") : "None"}
            </p>
          </div>
        </div>
        <p className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
          <strong>Features:</strong> Multiple independent checkboxes, track selected values as an array, toggle individual items on/off
        </p>
      </div>

      {/* RadioGroup Component */}
      <div
        className="rounded-2xl border p-8 mb-8"
        style={{
          background: "rgb(var(--card))",
          border: "1px solid rgb(var(--border))",
        }}
      >
        <h2
          className="text-2xl font-bold mb-6"
          style={{ color: "rgb(var(--text-primary))", fontFamily: "var(--font-display)" }}
        >
          RadioGroup
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-8">
          <div>
            <RadioGroup
              label="Choose Plan"
              name="plan"
              value={radioValue}
              onChange={(e) => setRadioValue(e.target.value)}
              options={[
                {
                  value: "option1",
                  label: "Free Plan",
                  description: "For individuals and small teams",
                },
                {
                  value: "option2",
                  label: "Pro Plan",
                  description: "For growing businesses",
                },
                {
                  value: "option3",
                  label: "Enterprise",
                  description: "For large organizations",
                },
              ]}
            />
          </div>
          <div>
            <RadioGroup
              label="Notification Frequency"
              name="frequency"
              defaultValue="weekly"
              options={[
                { value: "daily", label: "Daily" },
                { value: "weekly", label: "Weekly" },
                { value: "monthly", label: "Monthly" },
              ]}
            />
          </div>
        </div>
        <p className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
          <strong>Features:</strong> Custom radio styling, label with optional description, grouping support, smooth transitions
        </p>
      </div>

      {/* Button Component */}
      <div
        className="rounded-2xl border p-8 mb-8"
        style={{
          background: "rgb(var(--card))",
          border: "1px solid rgb(var(--border))",
        }}
      >
        <h2
          className="text-2xl font-bold mb-6"
          style={{ color: "rgb(var(--text-primary))", fontFamily: "var(--font-display)" }}
        >
          Button
        </h2>

        {/* Primary Buttons */}
        <div className="mb-8">
          <h3
            className="text-lg font-semibold mb-4"
            style={{ color: "rgb(var(--text-primary))" }}
          >
            Primary Variant
          </h3>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary" size="sm">
              Small Button
            </Button>
            <Button variant="primary" size="md">
              Medium Button
            </Button>
            <Button variant="primary" size="lg">
              Large Button
            </Button>
            <Button variant="primary" disabled>
              Disabled
            </Button>
          </div>
        </div>

        {/* Secondary Buttons */}
        <div className="mb-8">
          <h3
            className="text-lg font-semibold mb-4"
            style={{ color: "rgb(var(--text-primary))" }}
          >
            Secondary Variant
          </h3>
          <div className="flex flex-wrap gap-4">
            <Button variant="secondary" size="sm">
              Small Button
            </Button>
            <Button variant="secondary" size="md">
              Medium Button
            </Button>
            <Button variant="secondary" size="lg">
              Large Button
            </Button>
            <Button variant="secondary" disabled>
              Disabled
            </Button>
          </div>
        </div>

        {/* Danger Buttons */}
        <div className="mb-8">
          <h3
            className="text-lg font-semibold mb-4"
            style={{ color: "rgb(var(--text-primary))" }}
          >
            Danger Variant
          </h3>
          <div className="flex flex-wrap gap-4">
            <Button variant="danger" size="sm">
              Delete
            </Button>
            <Button variant="danger" size="md">
              Remove Item
            </Button>
            <Button variant="danger" size="lg">
              Confirm Delete
            </Button>
            <Button variant="danger" disabled>
              Disabled
            </Button>
          </div>
        </div>

        {/* Ghost Buttons */}
        <div className="mb-8">
          <h3
            className="text-lg font-semibold mb-4"
            style={{ color: "rgb(var(--text-primary))" }}
          >
            Ghost Variant
          </h3>
          <div className="flex flex-wrap gap-4">
            <Button variant="ghost" size="sm">
              Cancel
            </Button>
            <Button variant="ghost" size="md">
              Skip
            </Button>
            <Button variant="ghost" size="lg">
              Learn More
            </Button>
            <Button variant="ghost" disabled>
              Disabled
            </Button>
          </div>
        </div>

        <p className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
          <strong>Features:</strong> 4 variants (primary, secondary, danger, ghost), 3 sizes (sm, md, lg), disabled state, loading state with spinner
        </p>
      </div>

      {/* Badge Component */}
      <div
        className="rounded-2xl border p-8 mb-8"
        style={{
          background: "rgb(var(--card))",
          border: "1px solid rgb(var(--border))",
        }}
      >
        <h2
          className="text-2xl font-bold mb-6"
          style={{ color: "rgb(var(--text-primary))", fontFamily: "var(--font-display)" }}
        >
          Badge
        </h2>
        <div className="flex flex-wrap gap-3 mb-8">
          <Badge color="blue">Badge Blue</Badge>
          <Badge color="green">Badge Green</Badge>
          <Badge color="red">Badge Red</Badge>
          <Badge color="yellow">Badge Yellow</Badge>
          <Badge color="purple">Badge Purple</Badge>
          <Badge color="gray">Badge Gray</Badge>
        </div>
        <p className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
          <strong>Features:</strong> 6 color variants (blue, green, red, yellow, purple, gray), lightweight, perfect for status indicators
        </p>
      </div>

      {/* Modal Component */}
      <div
        className="rounded-2xl border p-8 mb-8"
        style={{
          background: "rgb(var(--card))",
          border: "1px solid rgb(var(--border))",
        }}
      >
        <h2
          className="text-2xl font-bold mb-6"
          style={{ color: "rgb(var(--text-primary))", fontFamily: "var(--font-display)" }}
        >
          Modal
        </h2>
        <div className="flex flex-wrap gap-4 mb-8">
          <Button variant="primary" onClick={() => setShowSmModal(true)}>Open Small Modal</Button>
          <Button variant="primary" onClick={() => setShowMdModal(true)}>Open Medium Modal</Button>
          <Button variant="primary" onClick={() => setShowLgModal(true)}>Open Large Modal</Button>
          <Button variant="primary" onClick={() => setShowXlModal(true)}>Open Extra Large Modal</Button>
          <Button variant="primary" onClick={() => setShowFullModal(true)}>Open Full Screen Modal</Button>
        </div>
        <p className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
          <strong>Features:</strong> 5 sizes (sm, md, lg, xl, full), animated backdrop and content, ESC to close, focus lock
        </p>

        {/* Modals */}
        <Modal open={showSmModal} onClose={() => setShowSmModal(false)} title="Small Modal" size="sm">
          <p className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
            This is a small modal, perfect for confirmations or simple forms.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowSmModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => setShowSmModal(false)}>Confirm</Button>
          </div>
        </Modal>

        <Modal open={showMdModal} onClose={() => setShowMdModal(false)} title="Medium Modal" size="md">
          <p className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
            This is a medium modal. It&apos;s the default size and works well for most use cases, like settings or data entry.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowMdModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => setShowMdModal(false)}>Confirm</Button>
          </div>
        </Modal>

        <Modal open={showLgModal} onClose={() => setShowLgModal(false)} title="Large Modal" size="lg">
          <p className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
            This is a large modal. Use it when you need to display complex forms, tables, or a lot of content that requires more horizontal space.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowLgModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => setShowLgModal(false)}>Confirm</Button>
          </div>
        </Modal>

        <Modal open={showXlModal} onClose={() => setShowXlModal(false)} title="Extra Large Modal" size="xl">
          <p className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
            This is an extra large modal. It provides ample space for complex interfaces like dashboards, advanced editors, or multi-column layouts within a modal context.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowXlModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => setShowXlModal(false)}>Confirm</Button>
          </div>
        </Modal>

        <Modal open={showFullModal} onClose={() => setShowFullModal(false)} title="Full Screen Modal" size="full">
          <p className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
            This is a nearly full-screen modal. It takes up 95% of the viewport and is ideal for immersive tasks or when you need maximum screen real estate without fully navigating away from the underlying context.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowFullModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => setShowFullModal(false)}>Confirm</Button>
          </div>
        </Modal>
      </div>

      {/* Toastify */}
      <div
        className="rounded-2xl border p-8 mb-8"
        style={{
          background: "rgb(var(--card))",
          border: "1px solid rgb(var(--border))",
        }}
      >
        <h2
          className="text-2xl font-bold mb-6"
          style={{ color: "rgb(var(--text-primary))", fontFamily: "var(--font-display)" }}
        >
          Toastify
        </h2>
        <div className="flex flex-wrap gap-4 mb-8">
          <Button variant="secondary" className="bg-green-600 text-white border-green-600 hover:bg-green-700 hover:border-green-700" onClick={() => toast.success("Operation completed successfully!")}>
            Success Toast
          </Button>
          <Button variant="danger" onClick={() => toast.error("Something went wrong!")}>
            Error Toast
          </Button>
          <Button variant="secondary" onClick={() => toast.warning("Please check your input.")}>
            Warning Toast
          </Button>
          <Button variant="ghost" onClick={() => toast.info("Here is some useful information.")}>
            Info Toast
          </Button>
          <Button variant="primary" onClick={() => toast("Default plain toast")}>
            Default Toast
          </Button>
        </div>
        <p className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
          <strong>Features:</strong> 5 toast types (success, error, warning, info, default), auto-dismiss, customizable positioning (configured globally via ToastContainer in layout)
        </p>
      </div>

      {/* Summary Section */}
      <div
        className="rounded-2xl border p-8"
        style={{
          background: "rgb(var(--bg))",
          border: "1px solid rgb(var(--border))",
        }}
      >
        <h2
          className="text-2xl font-bold mb-4"
          style={{ color: "rgb(var(--text-primary))", fontFamily: "var(--font-display)" }}
        >
          💡 Component Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <div
              className="font-semibold mb-1"
              style={{ color: "rgb(var(--text-primary))" }}
            >
              Input
            </div>
            <div className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
              Text input with label, error handling, focus states, and date/time selection
            </div>
          </div>
          <div>
            <div
              className="font-semibold mb-1"
              style={{ color: "rgb(var(--text-primary))" }}
            >
              Select
            </div>
            <div className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
              Dropdown with custom styling and options
            </div>
          </div>
          <div>
            <div
              className="font-semibold mb-1"
              style={{ color: "rgb(var(--text-primary))" }}
            >
              Textarea
            </div>
            <div className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
              Multi-line text input with resizing
            </div>
          </div>
          <div>
            <div
              className="font-semibold mb-1"
              style={{ color: "rgb(var(--text-primary))" }}
            >
              Checkbox
            </div>
            <div className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
              Custom checkbox with label and description
            </div>
          </div>
          <div>
            <div
              className="font-semibold mb-1"
              style={{ color: "rgb(var(--text-primary))" }}
            >
              Multi Checkbox
            </div>
            <div className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
              Multiple independent checkboxes with array state tracking
            </div>
          </div>
          <div>
            <div
              className="font-semibold mb-1"
              style={{ color: "rgb(var(--text-primary))" }}
            >
              RadioGroup
            </div>
            <div className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
              Radio buttons with grouping and descriptions
            </div>
          </div>
          <div>
            <div
              className="font-semibold mb-1"
              style={{ color: "rgb(var(--text-primary))" }}
            >
              Button
            </div>
            <div className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
              4 variants, 3 sizes, loading state support
            </div>
          </div>
          <div>
            <div
              className="font-semibold mb-1"
              style={{ color: "rgb(var(--text-primary))" }}
            >
              Badge
            </div>
            <div className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
              6 color variants for status indicators
            </div>
          </div>
          <div>
            <div
              className="font-semibold mb-1"
              style={{ color: "rgb(var(--text-primary))" }}
            >
              Modal
            </div>
            <div className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
              Animated modal dialogs in 5 sizes (sm, md, lg, xl, full)
            </div>
          </div>
          <div>
            <div
              className="font-semibold mb-1"
              style={{ color: "rgb(var(--text-primary))" }}
            >
              Toastify
            </div>
            <div className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
              Toast notifications with 5 types (success, error, warning, info, default)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
