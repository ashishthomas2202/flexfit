"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusCircleIcon, Trash2Icon, CheckCircleIcon } from "lucide-react";

export default function MealPlanDialog({ onCreate, meals, children }) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [planName, setPlanName] = useState("");
    const [selectedMeals, setSelectedMeals] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedDiet, setSelectedDiet] = useState("");
    const [note, setNote] = useState("");
    const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
    const [endDate, setEndDate] = useState("");
    const [daysOfWeek, setDaysOfWeek] = useState({
        Monday: false,
        Tuesday: false,
        Wednesday: false,
        Thursday: false,
        Friday: false,
        Saturday: false,
        Sunday: false,
    });

    // Filter meals by search term, category, and diet
    const filteredMeals = meals.filter((meal) => {
        const matchesSearchTerm = meal.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory ? meal.category === selectedCategory : true;
        const matchesDiet = selectedDiet ? meal.diet?.includes(selectedDiet) : true;
        return matchesSearchTerm && matchesCategory && matchesDiet;
    });

    const handleToggleMeal = (meal) => {
        setSelectedMeals((prev) => {
            if (prev.some((selectedMeal) => selectedMeal.id === meal.id)) {
                return prev.filter((selectedMeal) => selectedMeal.id !== meal.id);
            } else {
                return [...prev, meal];
            }
        });
    };

    const handleRemoveMeal = (mealId) => {
        setSelectedMeals((prev) => prev.filter((meal) => meal.id !== mealId));
    };

    const handleCheckboxChange = (day) => {
        setDaysOfWeek((prev) => ({ ...prev, [day]: !prev[day] }));


    };

    const handleCreateMealPlan = () => {
        const data = {
            planName,
            days: Object.keys(daysOfWeek)
                .filter((day) => daysOfWeek[day])
                .map((day) => ({
                    day,
                    meals: selectedMeals.map((meal, index) => ({
                        mealId: meal.id,
                        mealType: meal.mealType || "Lunch",
                        name: meal.name,
                        macros: meal.macros || { protein: 0, carbs: 0, fat: 0 },
                        calories: meal.calories || 0,
                        order: index,
                    })),
                })),
            startDate,
            endDate,
            status: "in progress",
            note,
        };

        onCreate(data);
        resetFields();
        setDialogOpen(false);
    };

    const resetFields = () => {
        setPlanName("");
        setSelectedMeals([]);
        setSearchTerm("");
        setStartDate(new Date().toISOString().split("T")[0]);
        setEndDate("");
        setDaysOfWeek({
            Monday: false,
            Tuesday: false,
            Wednesday: false,
            Thursday: false,
            Friday: false,
            Saturday: false,
            Sunday: false,
        });
        setNote("");
    };

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-2xl w-full max-h-screen overflow-y-auto">
                <DialogTitle>Create Meal Plan</DialogTitle>
                <div>
                    <Label>Plan Name</Label>
                    <Input value={planName} onChange={(e) => setPlanName(e.target.value)} />
                </div>

                {/* Search Filters */}
                <div className="mt-4">
                    <Label>Search Meals</Label>
                    <Input
                        placeholder="Search for a meal..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="mt-4 flex gap-4">
                    <div className="w-1/2">
                        <Label>Filter by Category</Label>
                        <select
                            className="border p-2 rounded-md w-full"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            <option value="">All</option>
                            {/* Map over unique categories from meals data */}
                            {Array.from(new Set(meals.map((meal) => meal.category))).map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="w-1/2">
                        <Label>Filter by Diet</Label>
                        <select
                            className="border p-2 rounded-md w-full"
                            value={selectedDiet}
                            onChange={(e) => setSelectedDiet(e.target.value)}
                        >
                            <option value="">All</option>
                            {/* Map over unique diet options from meals data */}
                            {Array.from(new Set(meals.flatMap((meal) => meal.diet || []))).map((diet) => (
                                <option key={diet} value={diet}>
                                    {diet}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="mt-4">
                    <ScrollArea className="h-40 border rounded-md mt-2 p-3">
                        {filteredMeals.map((meal) => (
                            <div
                                key={meal.id}
                                className="flex justify-between items-center p-3 bg-gray-100 rounded-md mb-2"
                            >
                                <div>
                                    <p className="font-semibold">{meal.name}</p>
                                    <p className="text-sm text-gray-600">
                                        Calories: {meal.calories} kcal
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Protein: {meal.macros?.protein || 0}g, Carbs: {meal.macros?.carbs || 0}g, Fat: {meal.macros?.fat || 0}g
                                    </p>
                                </div>
                                {selectedMeals.some((selectedMeal) => selectedMeal.id === meal.id) ? (
                                    <CheckCircleIcon
                                        onClick={() => handleToggleMeal(meal)}
                                        size={24}
                                        className="cursor-pointer text-green-500"
                                        aria-label="Selected Meal"
                                    />
                                ) : (
                                    <PlusCircleIcon
                                        onClick={() => handleToggleMeal(meal)}
                                        size={24}
                                        className="cursor-pointer text-gray-600 hover:text-gray-800"
                                        aria-label="Add Meal"
                                    />
                                )}
                            </div>
                        ))}
                    </ScrollArea>
                </div>

                <div className="mt-4">
                    <Label>Selected Meals</Label>
                    <ScrollArea className="h-32 border rounded-md mt-2 p-3"> {/* Added padding here */}
                        {selectedMeals.map((meal) => (
                            <div
                                key={meal.id}
                                className="flex justify-between items-center p-3 bg-gray-100 rounded-md mb-2">
                                <div>
                                    <p className="font-semibold">{meal.name}</p>
                                    <p className="text-sm text-gray-600">
                                        Calories: {meal.calories} kcal
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Protein: {meal.macros?.protein || 0}g, Carbs: {meal.macros?.carbs || 0}g, Fat: {meal.macros?.fat || 0}g
                                    </p>
                                </div>
                                <Trash2Icon
                                    onClick={() => handleRemoveMeal(meal.id)}
                                    size={20}
                                    className="cursor-pointer text-red-500"
                                    aria-label="Remove Meal"
                                />
                            </div>
                        ))}
                    </ScrollArea>
                </div>

                <div className="mt-4">
                    <Label>Days of the Week</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {Object.keys(daysOfWeek).map((day) => (
                            <div key={day} className="flex items-center">
                                <Checkbox
                                    checked={daysOfWeek[day]}
                                    onCheckedChange={() => handleCheckboxChange(day)}
                                />
                                <span className="ml-2">{day}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-4">
                    <Label>Start Date</Label>
                    <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div>
                    <Label>End Date</Label>
                    <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
                <div>
                    <Label>Note</Label>
                    <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
                </div>
                <Button onClick={handleCreateMealPlan} className="mt-4">Create Meal Plan</Button>
            </DialogContent>
        </Dialog>
    );
}