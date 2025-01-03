import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/Card";
import { MinusCircleIcon, PlusCircleIcon } from "lucide-react";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { FaFire } from "react-icons/fa";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/Select";

export const CalorieBurnedTracker = ({
  burned = 0,
  goal = 10000,
  step: defaultStep = 100,
}) => {
  const [step, setStep] = useState(defaultStep);
  const [caloriesBurned, setCaloriesBurned] = useState(burned);
  const [percentage, setPercentage] = useState(0);

  // Handlers to increase or decrease calories burned
  const increaseCalorieBurned = () => {
    setCaloriesBurned(caloriesBurned + step);
  };

  const decreaseCalorieBurned = () => {
    // if (caloriesBurned > 0) setCaloriesBurned(caloriesBurned - 100);
    if (caloriesBurned - step >= 0) setCaloriesBurned(caloriesBurned - step);
    else setCaloriesBurned(0);
  };

  useLayoutEffect(() => {
    setPercentage((caloriesBurned / goal) * 100);
  }, [caloriesBurned]);

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-bold">Calories Burned</h2>
      </CardHeader>
      <CardContent>
        <ProgressRing percentage={percentage} color={"#f97316"} customContent>
          <div className="flex flex-col gap-2 justify-center items-center">
            <span className="bg-orange-50 p-5 rounded-full">
              <FaFire className="text-6xl text-orange-500" />
            </span>
            <div className="text-gray-700 dark:text-white">
              <p className="font-light text-center text-4xl">
                {caloriesBurned}
              </p>
              <p className="font-light text-center text-base opacity-30">
                / {goal} kCal
              </p>
            </div>
          </div>
        </ProgressRing>
      </CardContent>
      <CardFooter className="flex justify-center gap-6">
        <button onClick={decreaseCalorieBurned}>
          <MinusCircleIcon size={28} />
        </button>
        <Select
          onValueChange={(value) => {
            setStep(value);
          }}
        >
          <SelectTrigger className="w-fit">{step}x</SelectTrigger>
          <SelectContent>
            <SelectItem value={1}>1x</SelectItem>
            <SelectItem value={10}>10x</SelectItem>
            <SelectItem value={100}>100x</SelectItem>
            <SelectItem value={1000}>1000x</SelectItem>
          </SelectContent>
        </Select>
        <button onClick={increaseCalorieBurned}>
          <PlusCircleIcon size={28} />
        </button>
      </CardFooter>
    </Card>
  );
};
