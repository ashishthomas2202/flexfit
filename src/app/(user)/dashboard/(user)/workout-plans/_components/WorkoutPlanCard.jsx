"use client";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/Card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/Dropdown-menu";

import { cn } from "@/lib/utils";
import { Pen, Trash2 } from "lucide-react";
import moment from "moment-timezone";
import { useLayoutEffect, useState } from "react";
import { WorkoutDialog } from "@/app/(user)/dashboard/(user)/workout-plans/_components/WorkoutDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";

export const WorkoutPlanCard = ({
  workouts = [],
  workoutPlan,
  onUpdate = () => {},
  updateStatus = () => {},
  updateColor = () => {},
  onDelete = () => {},
}) => {
  const [workoutStats, setWorkoutStats] = useState({
    totalTime: 0,
    totalCalories: 0,
    totalUniqueWorkouts: 0,
    mostTargetedMuscleGroup: "",
    uniqueWorkouts: new Set(),
  });
  const [disableDelete, setDisableDelete] = useState(false);

  const colors = [
    { name: "Indigo", code: "#4F46E5" },
    { name: "Periwinkle", code: "#818CF8" },
    { name: "Lavender", code: "#C4B5FD" },
    { name: "Blush", code: "#F9A8D4" },
    { name: "Coral", code: "#FB7185" },
    { name: "Crimson", code: "#F87171" },
    { name: "Topaz", code: "#FFD700" },
    { name: "Saffron", code: "#FBBF24" },
    { name: "Amber", code: "#F59E0B" },
    { name: "Mint", code: "#34D399" },
    { name: "Emerald", code: "#10B981" },
    { name: "Lime", code: "#84CC16" },
    { name: "Azure", code: "#60A5FA" },
    { name: "Cerulean", code: "#3B82F6" },

    { name: "Slate", code: "#64748B" },
  ];

  const calculateWorkoutStats = (plan) => {
    let totalTime = 0;
    let totalCalories = 0;
    const uniqueWorkouts = new Set(); // Track unique workout names
    const muscleGroupFrequency = {}; // Track muscle group frequency

    plan.days.forEach((day) => {
      day.workouts.forEach((workout) => {
        const workoutData = workout.workoutId;
        const duration = workout.durationMin || workoutData.duration_min;
        const caloriesPerMin = workoutData.calories_burned_per_min;

        totalTime += duration;
        totalCalories += duration * caloriesPerMin;

        // Track unique workout names
        uniqueWorkouts.add(workoutData.id);

        // Track muscle group frequency
        workoutData.muscle_groups.forEach((group) => {
          muscleGroupFrequency[group] = (muscleGroupFrequency[group] || 0) + 1;
        });
      });
    });

    // Calculate most targeted muscle group
    let mostTargetedMuscleGroup = null;
    let maxFrequency = 0;

    for (const group in muscleGroupFrequency) {
      if (muscleGroupFrequency[group] > maxFrequency) {
        maxFrequency = muscleGroupFrequency[group];
        mostTargetedMuscleGroup = group;
      }
    }

    const totalUniqueWorkouts = uniqueWorkouts.size;

    const workoutStats = {
      totalTime, // Total time in minutes
      totalCalories, // Total calories burned
      totalUniqueWorkouts, // Total unique workouts in the plan
      mostTargetedMuscleGroup, // Most frequently targeted muscle group
      uniqueWorkouts, // Set of unique workout names
    };

    // Use this to set state or return the stats as needed
    setWorkoutStats(workoutStats);

    return workoutStats;
  };

  useLayoutEffect(() => {
    calculateWorkoutStats(workoutPlan);
  }, [workoutPlan]);

  return (
    <Card className="select-none">
      <CardHeader className="flex-row justify-between items-center p-4">
        <h3 className="text-xl  font-semibold">{workoutPlan.planName}</h3>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "text-sm font-light text-gray-600 p-1 rounded-xl border focus-visible:outline-none select-none",
                workoutPlan?.status === "active"
                  ? "border-violet-500 text-violet-500 dark:bg-violet-500 dark:text-white"
                  : "border-gray-500 text-gray-500 dark:bg-gray-500 dark:text-white"
              )}
            >
              {workoutPlan.status}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              value="active"
              onClick={() => {
                updateStatus(workoutPlan.id, "active");
              }}
            >
              <p>Active</p>
            </DropdownMenuItem>
            <DropdownMenuItem
              value="inactive"
              onClick={() => {
                updateStatus(workoutPlan.id, "inactive");
              }}
            >
              <p>In-Active</p>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="p-4 space-y-6">
        <div>
          <p className="text-sm font-semibold text-gray-600 mb-2">
            Workout Days:
          </p>
          <DaysList days={workoutPlan.days} />
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-600">
            Total Workouts:{" "}
            <span className="text-violet-500 font-bold text-base">
              {workoutStats?.totalUniqueWorkouts}
            </span>
          </p>
          <p className="text-sm font-semibold text-gray-600">
            Total Time:{" "}
            <span className="text-violet-500 font-bold text-base">
              {/* {workoutStats?.totalTime} mins */}
              {workoutStats?.totalTime > 60 ? (
                <>
                  {Math.floor(workoutStats?.totalTime / 60)} hr{" "}
                  {workoutStats?.totalTime % 60} mins
                </>
              ) : (
                `${workoutStats?.totalTime} mins`
              )}{" "}
            </span>
            <span className="text-sm text-violet-500">/ week</span>
          </p>
          <p className="text-sm font-semibold text-gray-600">
            Caloried Burn:{" "}
            <span className="text-violet-500 font-bold text-base">
              ~ {workoutStats?.totalCalories} kCal
            </span>
          </p>
          <p className="text-sm font-semibold text-gray-600">
            Most Targeted Muscle Group:{" "}
            <span className="text-violet-500 font-bold text-base">
              {workoutStats?.mostTargetedMuscleGroup}
            </span>
          </p>
          <div className="flex gap-2 items-center">
            <p className="text-sm font-semibold text-gray-600">Color:</p>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className=" border dark:border-none dark:bg-neutral-900 rounded-full p-1">
                  <div
                    className="h-5 w-5 rounded-full"
                    style={{
                      backgroundColor: workoutPlan.color,
                    }}
                  ></div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="dark:bg-neutral-800 dark:border-neutral-700 dark:text-white ">
                {colors.map((c) => (
                  <DropdownMenuItem
                    className="flex items-center gap-2 dark:hover:bg-neutral-900 dark:hover:text-white cursor-pointer"
                    key={`${c.code}-${Date()}-color-picker`}
                    onClick={() => updateColor(workoutPlan.id, c.code)}
                  >
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: c.code }}
                    ></div>
                    <p>{c.name}</p>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Start Date:</span>{" "}
            <span className="text-violet-500">
              {moment(workoutPlan.startDate).format("MMM DD, YYYY")}
            </span>
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-semibold">End Date:</span>{" "}
            <span className="text-violet-500">
              {workoutPlan?.endDate
                ? moment(workoutPlan.endDate).format("MMM DD, YYYY")
                : "-"}
            </span>
          </p>
        </div>
      </CardContent>
      <CardFooter className="p-4 flex justify-between">
        <WorkoutDialog
          workouts={workouts}
          data={workoutPlan}
          mode="update"
          onUpdate={onUpdate}
        >
          <Button
            className="h-10 w-10  p-2 text-primary border-primary bg-transparent hover:bg-primary hover:text-white"
            variant="outline"
          >
            <Pen />
          </Button>
        </WorkoutDialog>
        <WorkoutViewDialog
          // plan={workoutPlan}
          workouts={workoutStats?.uniqueWorkouts}
          listOfWorkouts={workouts}
        />
        <Button
          className="h-10 w-10 p-2  text-rose-500 border-rose-500 bg-transparent hover:bg-rose-500 hover:text-white"
          variant="outline"
          disabled={disableDelete}
          onClick={() => {
            setDisableDelete(true);
            onDelete(workoutPlan.id);
          }}
        >
          <Trash2 />
        </Button>
      </CardFooter>
    </Card>
  );
};

const DaysList = ({ days = [] }) => {
  let daysList = {
    Monday: {
      symbol: "M",
      selected: false,
    },
    Tuesday: {
      symbol: "T",
      selected: false,
    },

    Wednesday: {
      symbol: "W",
      selected: false,
    },
    Thursday: {
      symbol: "Th",
      selected: false,
    },
    Friday: {
      symbol: "F",
      selected: false,
    },
    Saturday: {
      symbol: "S",
      selected: false,
    },
    Sunday: {
      symbol: "Su",
      selected: false,
    },
  };

  days.map((d) => {
    daysList[d.day].selected = true;
  });

  return (
    <ul className="flex gap-2">
      {Object.keys(daysList).map((d, index) => (
        <li
          key={index}
          className={cn(
            "w-8 h-8 flex justify-center items-center border rounded-full text-sm font-light text-violet-500 border-violet-500",
            daysList[d].selected ? "bg-violet-500 text-white" : "bg-transparent"
          )}
        >
          {daysList[d].symbol}
        </li>
      ))}
    </ul>
  );
};

const WorkoutViewDialog = ({ workouts = [], listOfWorkouts }) => {
  const mapWorkouts = () => {
    return [...workouts].map((workout) => {
      const currentWorkout = listOfWorkouts.find((w) => w.id === workout);
      return {
        ...currentWorkout,
      };
    });
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-violet-400 hover:bg-violet-500 text-white">
          View Workouts
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Workouts</DialogTitle>
        <DialogDescription>
          List of workouts in the workout plan
        </DialogDescription>
        <ul className="grid grid-cols-2 gap-2">
          {mapWorkouts().map((workout) => (
            <li
              key={workout.id}
              className="border dark:border-neutral-700 p-2 rounded-lg shadow-sm space-y-2"
            >
              <p className="text-sm font-semibold">{workout?.name}</p>
              <p className="text-xs text-gray-500">{workout?.description}</p>
              <p className="text-xs text-gray-500">
                Muscle Groups: {workout?.muscle_groups.join(", ")}
              </p>

              <p className="text-xs text-gray-500">
                Calorie Burn: {workout?.calories_burned_per_min} kCal/min
              </p>
              <p className="text-xs text-gray-500">
                Duration: {workout?.duration_min} mins
              </p>
              <p className="text-xs text-gray-500">
                Equipment: {workout?.equipment.join(", ")}
              </p>
              <p className="text-xs text-gray-500">
                Difficulty: {workout?.difficulty_level}
              </p>
              <p className="text-xs text-gray-500">
                Sets: {workout?.sets} Reps: {workout?.reps}
              </p>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
};
