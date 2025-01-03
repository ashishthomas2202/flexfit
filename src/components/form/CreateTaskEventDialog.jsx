"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import axios from "axios";

// Validation Schema for Tasks and Events
const taskSchema = Yup.object().shape({
  name: Yup.string().required("Task name is required."),
  date: Yup.date().required("Date is required."),
  time: Yup.string().required("Time is required."),
  repeat: Yup.string().nullable(),
  days: Yup.array().nullable(),
  color: Yup.string()
    .nullable()
    .matches(/^#[0-9A-F]{6}$/i, "Invalid color code."),
});

const eventSchema = Yup.object().shape({
  name: Yup.string().required("Event name is required."),
  start: Yup.date().required("Start date is required."),
  end: Yup.date().nullable(),
  startTime: Yup.string().nullable(),
  repeat: Yup.string()
    .oneOf(["daily", "weekly", "monthly", null], "Invalid repeat option.")
    .nullable(),
  days: Yup.array().when("repeat", {
    is: "weekly",
    then: Yup.array()
      .of(Yup.string())
      .min(1, "Select at least one day for weekly repeat.")
      .nullable(),
  }),
  day: Yup.number().when("repeat", {
    is: "monthly",
    then: Yup.number()
      .min(1, "Day must be at least 1.")
      .max(31, "Day must be at most 31.")
      .required("Specify a day for monthly repeat."),
  }),
  color: Yup.string()
    .nullable()
    .matches(/^#[0-9A-F]{6}$/i, "Invalid color code."),
});

const CreateTaskEventDialog = ({ onCreated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("task");

  // Task Form
  const {
    control: taskControl,
    handleSubmit: handleTaskSubmit,
    formState: { errors: taskErrors },
    reset: resetTaskForm,
  } = useForm({
    resolver: yupResolver(taskSchema),
    defaultValues: {
      name: "",
      date: "",
      time: "",
      repeat: null,
      days: [],
      color: "#8b5cf6",
    },
  });

  // Event Form
  const {
    control: eventControl,
    handleSubmit: handleEventSubmit,
    watch: watchEvent,
    formState: { errors: eventErrors },
    reset: resetEventForm,
  } = useForm({
    resolver: yupResolver(eventSchema),
    defaultValues: {
      name: "",
      start: "",
      end: "",
      startTime: "",
      repeat: null,
      days: [],
      day: null,
      color: "#8b5cf6",
    },
  });

  const eventRepeat = watchEvent("repeat");

  const submitTask = async (data) => {
    const formattedData = {
      ...data,
      type: "task",
    };

    try {
      const response = await axios.post("/api/events/create", formattedData);
      if (response.data.success) {
        onCreated(response.data.data);
        setIsOpen(false);
        resetTaskForm();
      }
    } catch (error) {
      console.error("Error creating task:", error.response?.data || error);
    }
  };

  const submitEvent = async (data) => {
    console.log("Submitting event:", data); // Check if the handler is triggered
    const formattedData = {
      ...data,
      type: "event",
    };

    try {
      const response = await axios.post("/api/events/create", formattedData);
      if (response.data.success) {
        onCreated(response.data.data);
        setIsOpen(false);
        resetEventForm();
      }
    } catch (error) {
      console.error("Error creating event:", error.response?.data || error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setIsOpen(true)}>Create Task/Event</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Task or Event</DialogTitle>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="task">Task</TabsTrigger>
            <TabsTrigger value="event">Event</TabsTrigger>
          </TabsList>

          {/* Task Form */}
          <TabsContent value="task">
            <form onSubmit={handleTaskSubmit(submitTask)} className="space-y-4">
              <Controller
                name="name"
                control={taskControl}
                render={({ field }) => (
                  <div>
                    <label>Name</label>
                    <Input {...field} placeholder="Task Name" />
                    {taskErrors.name && (
                      <p className="text-red-500">{taskErrors.name.message}</p>
                    )}
                  </div>
                )}
              />
              <Controller
                name="date"
                control={taskControl}
                render={({ field }) => (
                  <div>
                    <label>Date</label>
                    <Input {...field} type="date" />
                    {taskErrors.date && (
                      <p className="text-red-500">{taskErrors.date.message}</p>
                    )}
                  </div>
                )}
              />
              <Controller
                name="time"
                control={taskControl}
                render={({ field }) => (
                  <div>
                    <label>Time</label>
                    <Input {...field} type="time" />
                    {taskErrors.time && (
                      <p className="text-red-500">{taskErrors.time.message}</p>
                    )}
                  </div>
                )}
              />
              <Controller
                name="color"
                control={taskControl}
                render={({ field }) => (
                  <div>
                    <label>Color</label>
                    <Input {...field} type="color" />
                  </div>
                )}
              />
              <DialogFooter>
                <Button type="submit">Create Task</Button>
              </DialogFooter>
            </form>
          </TabsContent>

          {/* Event Form */}
          <TabsContent value="event">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleEventSubmit(submitEvent)();
              }}
              className="space-y-4"
            >
              <Controller
                name="name"
                control={eventControl}
                render={({ field }) => (
                  <div>
                    <label>Name</label>
                    <Input {...field} placeholder="Event Name" />
                    {eventErrors.name && (
                      <p className="text-red-500">{eventErrors.name.message}</p>
                    )}
                  </div>
                )}
              />
              <Controller
                name="start"
                control={eventControl}
                render={({ field }) => (
                  <div>
                    <label>Start Date</label>
                    <Input {...field} type="date" />
                    {eventErrors.start && (
                      <p className="text-red-500">
                        {eventErrors.start.message}
                      </p>
                    )}
                  </div>
                )}
              />
              <Controller
                name="end"
                control={eventControl}
                render={({ field }) => (
                  <div>
                    <label>End Date</label>
                    <Input {...field} type="date" />
                    {eventErrors.end && (
                      <p className="text-red-500">{eventErrors.end.message}</p>
                    )}
                  </div>
                )}
              />
              <Controller
                name="repeat"
                control={eventControl}
                render={({ field }) => (
                  <div>
                    <label>Repeat</label>
                    <select
                      {...field}
                      className="w-full border rounded px-3 py-2"
                    >
                      <option value="">None</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                    {eventErrors.repeat && (
                      <p className="text-red-500">
                        {eventErrors.repeat.message}
                      </p>
                    )}
                  </div>
                )}
              />
              {eventRepeat === "weekly" && (
                <Controller
                  name="days"
                  control={eventControl}
                  render={({ field }) => (
                    <div>
                      <label>Days</label>
                      <Input
                        {...field}
                        placeholder="Comma-separated days (e.g., Monday, Tuesday)"
                      />
                      {eventErrors.days && (
                        <p className="text-red-500">
                          {eventErrors.days.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              )}
              {eventRepeat === "monthly" && (
                <Controller
                  name="day"
                  control={eventControl}
                  render={({ field }) => (
                    <div>
                      <label>Day</label>
                      <Input
                        {...field}
                        type="number"
                        placeholder="Day (1-31)"
                      />
                      {eventErrors.day && (
                        <p className="text-red-500">
                          {eventErrors.day.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              )}
              <Controller
                name="startTime"
                control={eventControl}
                render={({ field }) => (
                  <div>
                    <label>Start Time</label>
                    <Input {...field} type="time" />
                  </div>
                )}
              />
              <Controller
                name="color"
                control={eventControl}
                render={({ field }) => (
                  <div>
                    <label>Color</label>
                    <Input {...field} type="color" />
                  </div>
                )}
              />
              <DialogFooter>
                <Button type="submit">Create Event</Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTaskEventDialog;

// "use client";

// import React, { useState } from "react";
// import { useForm, Controller, useWatch } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
// import * as Yup from "yup";
// import moment from "moment";
// import {
//   Dialog,
//   DialogTrigger,
//   DialogContent,
//   DialogHeader,
//   DialogFooter,
//   DialogTitle,
// } from "@/components/ui/Dialog";
// import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
// import { Input } from "@/components/ui/Input";
// import { Button } from "@/components/ui/Button";
// import axios from "axios";

// // Validation Schema for Tasks and Events
// const taskSchema = Yup.object().shape({
//   name: Yup.string().required("Task name is required."),
//   date: Yup.date().required("Date is required."),
//   time: Yup.string().required("Time is required."),
//   repeat: Yup.string().nullable(),
//   days: Yup.array().nullable(),
//   color: Yup.string()
//     .nullable()
//     .matches(/^#[0-9A-F]{6}$/i, "Invalid color code."),
// });

// const eventSchema = Yup.object().shape({
//   name: Yup.string().required("Event name is required."),
//   start: Yup.date().required("Start date is required."),
//   end: Yup.date().nullable(),
//   startTime: Yup.string().nullable(),
//   repeat: Yup.string().nullable(),
//   days: Yup.array().nullable(),
//   color: Yup.string()
//     .nullable()
//     .matches(/^#[0-9A-F]{6}$/i, "Invalid color code."),
// });

// const CreateTaskEventDialog = ({ onCreated }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [activeTab, setActiveTab] = useState("task");

//   const formatTimeTo12Hour = (time) => {
//     return moment(time, "HH:mm").format("hh:mm A");
//   };

//   // Task Form
//   const {
//     control: taskControl,
//     handleSubmit: handleTaskSubmit,
//     formState: { errors: taskErrors },
//     reset: resetTaskForm,
//   } = useForm({
//     resolver: yupResolver(taskSchema),
//     defaultValues: {
//       name: "",
//       date: "",
//       time: "",
//       repeat: null,
//       days: [],
//       color: "#8b5cf6",
//     },
//   });

//   // Event Form
//   const {
//     control: eventControl,
//     handleSubmit: handleEventSubmit,
//     formState: { errors: eventErrors },
//     reset: resetEventForm,
//   } = useForm({
//     resolver: yupResolver(eventSchema),
//     defaultValues: {
//       name: "",
//       start: "",
//       end: "",
//       startTime: "",
//       repeat: null,
//       days: [],
//       color: "#8b5cf6",
//     },
//   });

//   const submitTask = async (data) => {
//     const formattedData = {
//       ...data,
//       time: formatTimeTo12Hour(data.time),
//       type: "task",
//     };

//     try {
//       const response = await axios.post("/api/events/create", formattedData);
//       if (response.data.success) {
//         onCreated(response.data.data);
//         setIsOpen(false);
//         resetTaskForm();
//       }
//     } catch (error) {
//       console.error("Error creating task:", error.response?.data || error);
//     }
//   };

//   const submitEvent = async (data) => {
//     const formattedData = {
//       ...data,
//       startTime: data.startTime ? formatTimeTo12Hour(data.startTime) : null,
//       type: "event",
//     };

//     try {
//       const response = await axios.post("/api/events/create", formattedData);
//       if (response.data.success) {
//         onCreated(response.data.data);
//         setIsOpen(false);
//         resetEventForm();
//       }
//     } catch (error) {
//       console.error("Error creating event:", error.response?.data || error);
//     }
//   };

//   return (
//     <Dialog open={isOpen} onOpenChange={setIsOpen}>
//       <DialogTrigger asChild>
//         <Button onClick={() => setIsOpen(true)}>Create Task/Event</Button>
//       </DialogTrigger>
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>Create Task or Event</DialogTitle>
//         </DialogHeader>
//         <Tabs value={activeTab} onValueChange={setActiveTab}>
//           <TabsList>
//             <TabsTrigger value="task">Task</TabsTrigger>
//             <TabsTrigger value="event">Event</TabsTrigger>
//           </TabsList>

//           <TabsContent value="task">
//             <form onSubmit={handleTaskSubmit(submitTask)} className="space-y-4">
//               <Controller
//                 name="name"
//                 control={taskControl}
//                 render={({ field }) => (
//                   <div>
//                     <label>Name</label>
//                     <Input {...field} placeholder="Task Name" />
//                     {taskErrors.name && (
//                       <p className="text-red-500">{taskErrors.name.message}</p>
//                     )}
//                   </div>
//                 )}
//               />
//               <Controller
//                 name="date"
//                 control={taskControl}
//                 render={({ field }) => (
//                   <div>
//                     <label>Date</label>
//                     <Input {...field} type="date" />
//                     {taskErrors.date && (
//                       <p className="text-red-500">{taskErrors.date.message}</p>
//                     )}
//                   </div>
//                 )}
//               />
//               <Controller
//                 name="time"
//                 control={taskControl}
//                 render={({ field }) => (
//                   <div>
//                     <label>Time</label>
//                     <Input {...field} type="time" />
//                     {taskErrors.time && (
//                       <p className="text-red-500">{taskErrors.time.message}</p>
//                     )}
//                   </div>
//                 )}
//               />
//               <Controller
//                 name="color"
//                 control={taskControl}
//                 render={({ field }) => (
//                   <div>
//                     <label>Color</label>
//                     <Input {...field} type="color" />
//                   </div>
//                 )}
//               />
//               <DialogFooter>
//                 <Button type="submit">Create Task</Button>
//               </DialogFooter>
//             </form>
//           </TabsContent>

//           <TabsContent value="event">
//             <form
//               onSubmit={handleEventSubmit(submitEvent)}
//               className="space-y-4"
//             >
//               <Controller
//                 name="name"
//                 control={eventControl}
//                 render={({ field }) => (
//                   <div>
//                     <label>Name</label>
//                     <Input {...field} placeholder="Event Name" />
//                     {eventErrors.name && (
//                       <p className="text-red-500">{eventErrors.name.message}</p>
//                     )}
//                   </div>
//                 )}
//               />
//               <Controller
//                 name="start"
//                 control={eventControl}
//                 render={({ field }) => (
//                   <div>
//                     <label>Start Date</label>
//                     <Input {...field} type="date" />
//                     {eventErrors.start && (
//                       <p className="text-red-500">
//                         {eventErrors.start.message}
//                       </p>
//                     )}
//                   </div>
//                 )}
//               />
//               <Controller
//                 name="end"
//                 control={eventControl}
//                 render={({ field }) => (
//                   <div>
//                     <label>End Date</label>
//                     <Input {...field} type="date" />
//                     {eventErrors.end && (
//                       <p className="text-red-500">{eventErrors.end.message}</p>
//                     )}
//                   </div>
//                 )}
//               />
//               <Controller
//                 name="startTime"
//                 control={eventControl}
//                 render={({ field }) => (
//                   <div>
//                     <label>Start Time</label>
//                     <Input {...field} type="time" />
//                     {eventErrors.startTime && (
//                       <p className="text-red-500">
//                         {eventErrors.startTime.message}
//                       </p>
//                     )}
//                   </div>
//                 )}
//               />
//               <Controller
//                 name="color"
//                 control={eventControl}
//                 render={({ field }) => (
//                   <div>
//                     <label>Color</label>
//                     <Input {...field} type="color" />
//                   </div>
//                 )}
//               />
//               <DialogFooter>
//                 <Button type="submit">Create Event</Button>
//               </DialogFooter>
//             </form>
//           </TabsContent>
//         </Tabs>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default CreateTaskEventDialog;
