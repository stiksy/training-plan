/**
 * Export utilities for printing and saving workout schedules and meal plans
 */

export function printWorkoutSchedule() {
  const printContent = document.querySelector('.workout-schedule')
  if (!printContent) return

  const printWindow = window.open('', '', 'width=800,height=600')
  if (!printWindow) return

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Workout Schedule</title>
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            padding: 20px;
            max-width: 1000px;
            margin: 0 auto;
          }
          h1, h2 { color: #333; }
          .workout-day {
            border: 1px solid #ddd;
            padding: 15px;
            margin-bottom: 15px;
            page-break-inside: avoid;
          }
          .exercise-list { margin: 10px 0; }
          .exercise-item {
            padding: 8px;
            background: #f5f5f5;
            margin: 5px 0;
            border-radius: 4px;
          }
          .safety-note {
            background: #fff3cd;
            padding: 10px;
            margin: 10px 0;
            border-radius: 4px;
            border: 1px solid #ffc107;
          }
          @media print {
            button { display: none; }
          }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
        <script>
          window.onload = function() {
            window.print();
            window.close();
          }
        </script>
      </body>
    </html>
  `)

  printWindow.document.close()
}

export function printShoppingList() {
  const printContent = document.querySelector('.shopping-list')
  if (!printContent) return

  const printWindow = window.open('', '', 'width=800,height=600')
  if (!printWindow) return

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Shopping List</title>
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
          }
          h1, h3 { color: #333; }
          .shopping-category {
            margin-bottom: 25px;
            page-break-inside: avoid;
          }
          .category-title {
            font-size: 1.2rem;
            color: #646cff;
            border-bottom: 2px solid #e0e0e0;
            padding-bottom: 8px;
            margin-bottom: 12px;
            text-transform: uppercase;
          }
          .category-items {
            list-style: none;
            padding: 0;
          }
          .shopping-item {
            padding: 8px;
            margin-bottom: 8px;
            background: #f8f9ff;
            border-radius: 4px;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          input[type="checkbox"] {
            width: 18px;
            height: 18px;
          }
          .item-quantity {
            font-weight: 600;
            color: #646cff;
            min-width: 60px;
          }
          @media print {
            button { display: none; }
            .shopping-list-actions { display: none; }
            .add-item-btn, .clear-btn { display: none; }
          }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
        <script>
          window.onload = function() {
            window.print();
            window.close();
          }
        </script>
      </body>
    </html>
  `)

  printWindow.document.close()
}

export function exportMealPlanAsText(mealPlan: any): string {
  let text = `Meal Plan\n`
  text += `Week: ${mealPlan.weekRange}\n`
  text += `\n`

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const mealTypes = ['Breakfast', 'Lunch', 'Dinner']

  days.forEach((day, dayIndex) => {
    text += `\n${day.toUpperCase()}\n`
    text += `${'='.repeat(day.length)}\n`

    mealTypes.forEach((mealType) => {
      const meal = mealPlan.meals?.find(
        (m: any) => m.day === dayIndex && m.type.toLowerCase() === mealType.toLowerCase()
      )
      text += `${mealType}: ${meal?.recipe?.name || 'Not planned'}\n`
    })
  })

  return text
}
