import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/Card";
import { MinusCircleIcon, PlusCircleIcon } from "lucide-react";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { IoFootsteps } from "react-icons/io5";

export const StepCountTracker = ({ steps = 0, goal = 10000 }) => {
  const [currentSteps, setCurrentSteps] = useState(steps);
  const [percentage, setPercentage] = useState(0);

  // Handlers to increase or decrease steps
  const increaseSteps = () => {
    if (currentSteps < goal) setCurrentSteps(currentSteps + 1000); // Increment by 500 steps
  };

  const decreaseSteps = () => {
    if (currentSteps > 0) setCurrentSteps(currentSteps - 1000); // Decrement by 500 steps
  };

  useLayoutEffect(() => {
    setPercentage((currentSteps / goal) * 100);
  }, [currentSteps]);
  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-bold">Step Count</h2>
      </CardHeader>
      <CardContent>
        <ProgressRing
          percentage={percentage}
          // percentage={90}
          color={"#f43f5e"}
          customContent
        >
          <div className="flex flex-col gap-2 justify-center items-center">
            <span className="bg-rose-50 p-5 rounded-full">
              <IoFootsteps className="text-6xl text-rose-500" />
            </span>
            <div className="text-gray-700 dark:text-white">
              <p className="font-light text-center text-4xl ">{currentSteps}</p>
              <p className="font-light text-center text-base opacity-30">
                / {goal} steps
              </p>
            </div>
          </div>
        </ProgressRing>
      </CardContent>
      <CardFooter className="flex justify-center gap-10">
        <button onClick={decreaseSteps}>
          <MinusCircleIcon size={28} />
        </button>
        <button onClick={increaseSteps}>
          <PlusCircleIcon size={28} />
        </button>
      </CardFooter>
    </Card>
  );
};
