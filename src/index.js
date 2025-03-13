import { Hono } from "hono";
import { serve } from "@hono/node-server";
const app = new Hono();
const reminders = new Map();
// POST /reminders - Create a new reminder
app.post("/reminders", async (c) => {
    const body = await c.req.json();
    if (!body.id || !body.title || !body.dueDate) {
        return c.json({ error: "Missing required fields" }, 400);
    }
    reminders.set(body.id, { ...body, isCompleted: false });
    return c.json({ message: "Reminder created successfully" }, 201);
});
// GET /reminders/:id - Retrieve a reminder by ID
app.get("/reminders/:id", (c) => {
    const id = c.req.param("id");
    const reminder = reminders.get(id);
    return reminder ? c.json(reminder) : c.json({ error: "Reminder not found" }, 404);
});
// GET /reminders - Retrieve all reminders
app.get("/reminders", (c) => {
    return c.json(Array.from(reminders.values()));
});
// PATCH /reminders/:id - Update a reminder
app.patch("/reminders/:id", async (c) => {
    const id = c.req.param("id");
    if (!reminders.has(id)) {
        return c.json({ error: "Reminder not found" }, 404);
    }
    const body = await c.req.json();
    const updatedReminder = { ...reminders.get(id), ...body };
    reminders.set(id, updatedReminder);
    return c.json({ message: "Reminder updated successfully" });
});
// DELETE /reminders/:id - Delete a reminder
app.delete("/reminders/:id", (c) => {
    const id = c.req.param("id");
    return reminders.delete(id) ? c.json({ message: "Reminder deleted" }) : c.json({ error: "Reminder not found" }, 404);
});
// POST /reminders/:id/mark-completed - Mark reminder as completed
app.post("/reminders/:id/mark-completed", (c) => {
    const id = c.req.param("id");
    const reminder = reminders.get(id);
    if (!reminder)
        return c.json({ error: "Reminder not found" }, 404);
    reminder.isCompleted = true;
    reminders.set(id, reminder);
    return c.json({ message: "Reminder marked as completed" });
});
// POST /reminders/:id/unmark-completed - Unmark reminder as completed
app.post("/reminders/:id/unmark-completed", (c) => {
    const id = c.req.param("id");
    const reminder = reminders.get(id);
    if (!reminder)
        return c.json({ error: "Reminder not found" }, 404);
    reminder.isCompleted = false;
    reminders.set(id, reminder);
    return c.json({ message: "Reminder unmarked as completed" });
});
// GET /reminders/completed - Retrieve all completed reminders
app.get("/reminders/completed", (c) => {
    const completedReminders = Array.from(reminders.values()).filter((r) => r.isCompleted);
    return completedReminders.length ? c.json(completedReminders) : c.json({ error: "No completed reminders" }, 404);
});
// GET /reminders/not-completed - Retrieve all incomplete reminders
app.get("/reminders/not-completed", (c) => {
    const incompleteReminders = Array.from(reminders.values()).filter((r) => !r.isCompleted);
    return incompleteReminders.length ? c.json(incompleteReminders) : c.json({ error: "No incomplete reminders" }, 404);
});
// GET /reminders/due-today - Retrieve reminders due today
app.get("/reminders/due-today", (c) => {
    const today = new Date().toISOString().split("T")[0];
    const dueToday = Array.from(reminders.values()).filter((r) => r.dueDate === today);
    return dueToday.length ? c.json(dueToday) : c.json({ error: "No reminders due today" }, 404);
});
// Start the server
serve({
    fetch: app.fetch,
    port: 3000,
});
console.log("Server is running on http://localhost:3000");
