import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/Card";
import { MinusCircleIcon, PlusCircleIcon } from "lucide-react";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { BsFillLightningChargeFill } from "react-icons/bs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/Select";

export const CalorieIntakeTracker = ({
  intake = 0,
  goal = 10000,
  step: defaultStep = 100,
}) => {
  const [step, setStep] = useState(defaultStep);
  const [caloriesIntake, setCaloriesIntake] = useState(intake);
  const [percentage, setPercentage] = useState(0);

  // Handlers to increase or decrease calories intake
  const increaseCalorieIntake = () => {
    setCaloriesIntake(caloriesIntake + step);
  };

  const decreaseCalorieIntake = () => {
    if (caloriesIntake - step >= 0) setCaloriesIntake(caloriesIntake - step);
    else setCaloriesIntake(0);
  };

  useLayoutEffect(() => {
    setPercentage((caloriesIntake / goal) * 100);
  }, [caloriesIntake]);

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-bold">Calories Intake</h2>
      </CardHeader>
      <CardContent>
        <ProgressRing percentage={percentage} color={"#facc15"} customContent>
          <div className="flex flex-col gap-2 justify-center items-center">
            <span className="bg-yellow-50 p-5 rounded-full">
              <BsFillLightningChargeFill className="text-6xl text-yellow-400" />
            </span>
            <div className="text-gray-700 dark:text-white">
              <p className="font-light text-center text-4xl">
                {caloriesIntake}
              </p>
              <p className="font-light text-center text-base opacity-30">
                / {goal} kCal
              </p>
            </div>
          </div>
        </ProgressRing>
      </CardContent>
      <CardFooter className="flex justify-center gap-6">
        <button onClick={decreaseCalorieIntake}>
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
        <button onClick={increaseCalorieIntake}>
          <PlusCircleIcon size={28} />
        </button>
      </CardFooter>
    </Card>
  );
};
