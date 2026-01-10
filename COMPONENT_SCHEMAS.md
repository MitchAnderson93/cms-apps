# Component Schema Documentation

This document outlines all supported content component types in the Turbo config-driven form system. Each component type corresponds to a JSON schema used in the `pages[].content[]` array of your application configuration.

## Table of Contents

- [text](#text)
- [html](#html)
- [inpage-alert](#inpage-alert)
- [button](#button)
- [button-group](#button-group)
- [image](#image)
- [accordion](#accordion)
- [checkbox](#checkbox)
- [select](#select)
- [questionaire](#questionaire)
- [callout](#callout)
- [debug-button](#debug-button)
- [Conditional Visibility](#conditional-visibility)

---

## text

Simple text paragraph. Default component type when no type is specified.

### Schema

```json
{
  "type": "text",
  "content": "Your text content here"
}
```

### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | `string` | No | Component type identifier. Defaults to `"text"` |
| `content` | `string` | Yes | Text content to display |

### Example

```json
{
  "type": "text",
  "content": "This is a simple paragraph of text."
}
```

---

## html

Renders raw HTML content. Use with caution as content is injected via `dangerouslySetInnerHTML`.

### Schema

```json
{
  "type": "html",
  "content": "<p>Your <strong>HTML</strong> content</p>"
}
```

### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | `string` | Yes | Must be `"html"` |
| `content` | `string` | Yes | Raw HTML string to render |

### Security Note

**Warning**: This component renders unsanitized HTML. Only use trusted content to prevent XSS vulnerabilities.

### Example

```json
{
  "type": "html",
  "content": "<h2>Section Title</h2><p>This supports <em>HTML formatting</em>.</p>"
}
```

---

## inpage-alert

Displays informational alert boxes with different severity levels.

### Schema

```json
{
  "type": "inpage-alert",
  "alertType": "info",
  "heading": "Alert Title",
  "content": "<p>Alert content</p>",
  "appendFromAnswers": ["field-id-1", "field-id-2"]
}
```

### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | `string` | Yes | Must be `"inpage-alert"` |
| `alertType` | `string` | No | Alert severity: `"info"`, `"warning"`, `"error"`, `"success"`. Defaults to `"info"` |
| `heading` | `string` | Yes | Alert title/heading |
| `content` | `string` | Yes | Alert body content (supports HTML) |
| `appendFromAnswers` | `string[]` | No | Array of field IDs whose values should be interpolated into the content |

### Alert Types

- **info** (default): General informational message (blue)
- **warning**: Cautionary message (yellow/orange)
- **error**: Error or critical message (red)
- **success**: Success or confirmation message (green)

### Dynamic Content

Use `appendFromAnswers` to inject user responses into the alert content. Reference field values using the field ID.

### Example

```json
{
  "type": "inpage-alert",
  "alertType": "warning",
  "heading": "Important Notice",
  "content": "<p>Please review your application carefully before submitting.</p>"
}
```

---

## button

Single call-to-action button with link.

### Schema

```json
{
  "type": "button",
  "text": "Button Label",
  "link": "/next-page",
  "variant": "primary",
  "size": "large",
  "customClass": "my-custom-class"
}
```

### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | `string` | Yes | Must be `"button"` |
| `text` | `string` | Yes | Button label text |
| `link` | `string` | Yes | URL or route path for navigation |
| `variant` | `string` | No | Button style: `"primary"`, `"secondary"`, `"tertiary"` |
| `size` | `string` | No | Button size variant |
| `customClass` | `string` | No | Additional CSS classes |

### Example

```json
{
  "type": "button",
  "text": "Get Started",
  "link": "/introduction",
  "variant": "primary"
}
```

---

## button-group

Group of navigation/action buttons with validation support.

### Schema

```json
{
  "type": "button-group",
  "validateCheckbox": "terms-accepted",
  "buttons": [
    {
      "text": "Previous",
      "link": "/previous-page",
      "variant": "secondary",
      "validateWhen": []
    },
    {
      "text": "Next",
      "link": "/next-page",
      "variant": "primary",
      "validates": true,
      "validateWhen": [
        { "field": "answer", "operator": "equals", "value": "yes" }
      ]
    },
    {
      "text": "Submit",
      "variant": "primary",
      "validates": true,
      "submits": true
    }
  ]
}
```

### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | `string` | Yes | Must be `"button-group"` |
| `validateCheckbox` | `string` | No | Field ID of checkbox that must be checked to enable buttons (legacy) |
| `buttons` | `array` | Yes | Array of button configuration objects |

### Button Object Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `text` | `string` | Yes | Button label |
| `link` | `string` | No | Navigation target (route path or URL) |
| `variant` | `string` | No | Style variant: `"primary"`, `"secondary"` |
| `validates` | `boolean` | No | If `true`, button is disabled until validation passes |
| `validateWhen` | `array` | No | Custom validation conditions (see [Conditional Visibility](#conditional-visibility)) |
| `submits` | `boolean` | No | If `true`, triggers form submission to `submissionEndpoint` |

### Validation Priority

When a button has `validates: true`, validation occurs in this order:

1. **Button-specific `validateWhen`** - Custom conditions for this button
2. **Group `validateCheckbox`** - Legacy checkbox validation
3. **All visible questions** - Default validation (all required fields must be answered)

### Example

```json
{
  "type": "button-group",
  "buttons": [
    {
      "text": "Back",
      "link": "/previous",
      "variant": "secondary"
    },
    {
      "text": "Continue",
      "link": "/next",
      "variant": "primary",
      "validates": true
    }
  ]
}
```

---

## image

Displays an image with alt text.

### Schema

```json
{
  "type": "image",
  "src": "https://example.com/image.jpg",
  "alt": "Image description",
  "noMaxWidth": false
}
```

### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | `string` | Yes | Must be `"image"` |
| `src` | `string` | Yes | Image URL or path |
| `alt` | `string` | Yes | Alt text for accessibility |
| `noMaxWidth` | `boolean` | No | If `true`, removes max-width constraint |

### Example

```json
{
  "type": "image",
  "src": "https://www.qld.gov.au/?a=148648",
  "alt": "Example food label showing required components"
}
```

---

## accordion

Collapsible content sections with expand/collapse functionality.

### Schema

```json
{
  "type": "accordion",
  "id": "my-accordion",
  "showToggle": true,
  "items": [
    {
      "title": "Section 1",
      "content": "<p>Content for section 1</p>"
    },
    {
      "title": "Section 2",
      "content": "<p>Content for section 2</p>"
    }
  ]
}
```

### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | `string` | Yes | Must be `"accordion"` |
| `id` | `string` | No | Unique identifier. Auto-generated if not provided |
| `showToggle` | `boolean` | No | Show expand/collapse all toggle. Defaults to `true` |
| `items` | `array` | Yes | Array of accordion section objects |

### Accordion Item Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `title` | `string` | Yes | Section heading |
| `content` | `string` | Yes | Section content (supports HTML) |

### Example

```json
{
  "type": "accordion",
  "id": "faq-accordion",
  "items": [
    {
      "title": "What is required on a label?",
      "content": "<p>Food labels must include the product name, ingredients list, allergen information...</p>"
    },
    {
      "title": "Do I need a barcode?",
      "content": "<p>Barcodes are not legally required but may be needed for retail distribution.</p>"
    }
  ]
}
```

---

## checkbox

Single checkbox input with label.

### Schema

```json
{
  "type": "checkbox",
  "id": "terms-accepted",
  "label": "I agree to the terms and conditions",
  "required": true
}
```

### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | `string` | Yes | Must be `"checkbox"` |
| `id` | `string` | Yes | Unique field identifier for validation state |
| `label` | `string` | Yes | Checkbox label text |
| `required` | `boolean` | No | If `true`, must be checked for validation to pass |

### Storage

Checkbox value is stored in validation state as a boolean:
- Checked: `true`
- Unchecked: `false` or `undefined`

### Example

```json
{
  "type": "checkbox",
  "id": "consent-data-collection",
  "label": "I consent to the collection of my information",
  "required": true
}
```

---

## select

Dropdown selection input.

### Schema

```json
{
  "type": "select",
  "id": "business-type",
  "label": "Select your business type",
  "options": [
    { "value": "", "label": "-- Please select --" },
    { "value": "retail", "label": "Retail" },
    { "value": "wholesale", "label": "Wholesale" },
    { "value": "online", "label": "Online" }
  ],
  "required": true,
  "hint": "Choose the option that best describes your business",
  "errorMessage": "Please select a business type",
  "successMessage": "Thank you",
  "optional": false
}
```

### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | `string` | Yes | Must be `"select"` |
| `id` | `string` | Yes | Unique field identifier |
| `label` | `string` | Yes | Field label |
| `options` | `array` | Yes | Array of option objects |
| `required` | `boolean` | No | If `true`, field must be selected |
| `hint` | `string` | No | Help text displayed below the field |
| `errorMessage` | `string` | No | Custom error message |
| `successMessage` | `string` | No | Message shown on successful validation |
| `optional` | `boolean` | No | If `true`, displays "(optional)" indicator |

### Option Object Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `value` | `string` | Yes | Value stored in validation state |
| `label` | `string` | Yes | Display text for the option |

### Example

```json
{
  "type": "select",
  "id": "state",
  "label": "Select your state",
  "options": [
    { "value": "", "label": "-- Select state --" },
    { "value": "QLD", "label": "Queensland" },
    { "value": "NSW", "label": "New South Wales" },
    { "value": "VIC", "label": "Victoria" }
  ],
  "required": true
}
```

---

## questionaire

Group of related questions with multiple input types and conditional logic.

### Schema

```json
{
  "type": "questionaire",
  "questions": [
    {
      "id": "business-name",
      "type": "text",
      "label": "Business name",
      "required": true,
      "hint": "Enter your registered business name"
    },
    {
      "id": "has-employees",
      "type": "radio",
      "label": "Do you have employees?",
      "required": true,
      "options": [
        { "value": "yes", "label": "Yes" },
        { "value": "no", "label": "No" }
      ]
    },
    {
      "id": "employee-count",
      "type": "number",
      "label": "How many employees?",
      "required": true,
      "visibleWhen": [
        { "field": "has-employees", "operator": "equals", "value": "yes" }
      ]
    }
  ]
}
```

### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | `string` | Yes | Must be `"questionaire"` |
| `questions` | `array` | Yes | Array of question objects |

### Question Object Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | `string` | Yes | Unique field identifier |
| `type` | `string` | Yes | Question type: `"text"`, `"textarea"`, `"radio"`, `"multi"`, `"number"`, `"date"`, `"data-table"` |
| `label` | `string` | Yes | Question label/prompt |
| `required` | `boolean` | No | If `true`, field must be answered |
| `hint` | `string` | No | Help text displayed below the question |
| `options` | `array` | Conditional | Required for `radio` and `multi` types. Array of option objects |
| `minRows` | `number` | No | For `data-table` type: minimum required rows |
| `visibleWhen` | `array` | No | Conditional visibility rules (see [Conditional Visibility](#conditional-visibility)) |

### Question Types

#### text
Single-line text input.

```json
{
  "id": "product-name",
  "type": "text",
  "label": "Product name",
  "required": true
}
```

#### textarea
Multi-line text input.

```json
{
  "id": "description",
  "type": "textarea",
  "label": "Product description",
  "required": false
}
```

#### radio
Single-choice selection (radio buttons).

```json
{
  "id": "packaging-type",
  "type": "radio",
  "label": "Packaging type",
  "required": true,
  "options": [
    { "value": "bottle", "label": "Bottle" },
    { "value": "can", "label": "Can" },
    { "value": "box", "label": "Box" }
  ]
}
```

#### multi
Multiple-choice selection (checkboxes).

```json
{
  "id": "allergens",
  "type": "multi",
  "label": "Select all allergens present",
  "required": false,
  "options": [
    { "value": "peanuts", "label": "Peanuts" },
    { "value": "dairy", "label": "Dairy" },
    { "value": "eggs", "label": "Eggs" }
  ]
}
```

Stored as an array: `["peanuts", "eggs"]`

#### number
Numeric input.

```json
{
  "id": "quantity",
  "type": "number",
  "label": "Quantity",
  "required": true
}
```

#### date
Date picker input.

```json
{
  "id": "expiry-date",
  "type": "date",
  "label": "Expiry date",
  "required": true
}
```

#### data-table
Dynamic table with add/remove rows functionality.

```json
{
  "id": "ingredients-list",
  "type": "data-table",
  "label": "Enter your ingredients",
  "required": true,
  "minRows": 2,
  "hint": "Add one ingredient per row"
}
```

Stored as an array of strings: `["Flour", "Water", "Salt"]`

### Example

```json
{
  "type": "questionaire",
  "questions": [
    {
      "id": "is-packaged",
      "type": "radio",
      "label": "Is your product packaged?",
      "required": true,
      "options": [
        { "value": "yes", "label": "Yes" },
        { "value": "no", "label": "No" }
      ]
    },
    {
      "id": "package-type",
      "type": "text",
      "label": "What type of packaging?",
      "required": true,
      "visibleWhen": [
        { "field": "is-packaged", "operator": "equals", "value": "yes" }
      ]
    }
  ]
}
```

---

## callout

Highlighted informational box, typically for important notices or tips.

### Schema

```json
{
  "type": "callout",
  "title": "Pro Tip",
  "description": "This is helpful information to highlight",
  "className": "custom-callout-class"
}
```

### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | `string` | Yes | Must be `"callout"` |
| `title` | `string` | No | Callout heading |
| `description` | `string` | Yes | Callout content |
| `className` | `string` | No | Additional CSS classes for styling |

### Example

```json
{
  "type": "callout",
  "title": "Remember",
  "description": "Labels must comply with Food Standards Australia New Zealand regulations.",
  "className": "mb-4"
}
```

---

## debug-button

Developer tool for inspecting form state. Only visible when `VITE_DEBUG` environment variable is set.

### Schema

```json
{
  "type": "debug-button"
}
```

### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | `string` | Yes | Must be `"debug-button"` |

### Behavior

When clicked, logs the current validation state to the browser console, organized by page.

### Example

```json
{
  "type": "debug-button"
}
```

---

## Conditional Visibility

Most content components support the `visibleWhen` property to control conditional rendering based on user answers.

### Schema

```json
{
  "type": "inpage-alert",
  "heading": "Warning",
  "content": "This only shows when conditions are met",
  "visibleWhen": [
    {
      "field": "question-id",
      "operator": "equals",
      "value": "specific-value"
    }
  ]
}
```

### Condition Object Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `field` | `string` | Yes | ID of the field to check |
| `operator` | `string` | Yes | Comparison operator (see below) |
| `value` | `any` | Yes | Value to compare against |

### Supported Operators

- **equals**: Field value equals the specified value
- **notEquals**: Field value does not equal the specified value
- **contains**: Array field contains the specified value (for multi-select)
- **greaterThan**: Numeric field is greater than the specified value
- **lessThan**: Numeric field is less than the specified value
- **in**: Field value is in the specified array

### Logic

All conditions in the `visibleWhen` array must be satisfied (AND logic). For OR logic, you'll need to structure your questions differently.

### Examples

#### Show warning if user selected "yes"

```json
{
  "type": "inpage-alert",
  "alertType": "warning",
  "heading": "Important",
  "content": "You selected yes",
  "visibleWhen": [
    { "field": "user-choice", "operator": "equals", "value": "yes" }
  ]
}
```

#### Show question only if previous answer was "no"

```json
{
  "id": "alternative-option",
  "type": "text",
  "label": "Please provide an alternative",
  "required": true,
  "visibleWhen": [
    { "field": "standard-option", "operator": "equals", "value": "no" }
  ]
}
```

#### Show content if array contains value (multi-select)

```json
{
  "type": "inpage-alert",
  "heading": "Allergen Notice",
  "content": "You selected peanuts as an allergen",
  "visibleWhen": [
    { "field": "allergens", "operator": "contains", "value": "peanuts" }
  ]
}
```

#### Multiple conditions (AND logic)

```json
{
  "type": "callout",
  "description": "Shows only when both conditions are true",
  "visibleWhen": [
    { "field": "age", "operator": "greaterThan", "value": 18 },
    { "field": "country", "operator": "equals", "value": "AU" }
  ]
}
```

---

## Field Dependencies

You can configure field dependencies at the application level to automatically clear dependent fields when a parent field changes. This prevents stale data when conditional questions change.

### Configuration

Add `fieldDependencies` to your app config:

```json
{
  "fieldDependencies": {
    "parent-field-id": ["dependent-field-1", "dependent-field-2"],
    "has-employees": ["employee-count", "employee-names"]
  }
}
```

When `parent-field-id` changes, all dependent fields are cleared from the validation state.

### Example Use Case

```json
{
  "fieldDependencies": {
    "has-vehicle": ["vehicle-type", "vehicle-year", "vehicle-registration"]
  }
}
```

If user changes "Do you have a vehicle?" from "Yes" to "No", all vehicle-related fields are automatically cleared.

---

## Best Practices

### Accessibility
- Always provide `alt` text for images
- Use descriptive labels for all form fields
- Provide `hint` text for complex questions
- Use semantic heading structure in HTML content

### Performance
- Minimize use of `html` type with large content
- Use `visibleWhen` to reduce DOM complexity by hiding unused content
- Consider breaking large questionnaires across multiple pages

### User Experience
- Group related questions in `questionaire` components
- Use appropriate alert types for severity (`info`, `warning`, `error`, `success`)
- Provide clear validation error messages
- Use `hint` properties to guide users

### Validation
- Mark required fields with `required: true`
- Use `validateWhen` for complex conditional validation
- Test all conditional visibility paths
- Ensure field dependencies are configured for cascading questions

### Security
- Sanitize user input before using in `appendFromAnswers`
- Avoid using `html` type with user-generated content
- Validate data server-side regardless of client validation

---

## Version History

- **v1.0.0** (2026-01-10): Initial documentation
