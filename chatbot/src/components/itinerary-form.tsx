"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import type { TravelItineraryInput } from "@/lib/types";
import { Bot, Calendar as CalendarIcon, Loader2, MapPin, Users, Wallet, Sparkles, Languages } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

const formSchema = z.object({
  origin: z.string().min(2, "Please enter a valid starting location"),
  destination: z.string().min(2, "Please enter a valid destination"),
  departureDate: z.date({
    required_error: "Departure date is required",
  }),
  arrivalDate: z.date({
    required_error: "Arrival date is required",
  }),
  numberOfPeople: z.string().min(1, "At least 1 person"),
  budget: z.string().min(2, "Please specify a budget style"),
  style: z.string().min(2, "Please specify a travel style"),
  language: z.enum(["Hindi", "English"]),
}).refine((data) => data.arrivalDate >= data.departureDate, {
  message: "Arrival date must be after departure date",
  path: ["arrivalDate"],
});

interface ItineraryFormProps {
  onSubmit: (data: TravelItineraryInput) => void;
  isLoading: boolean;
}

export default function ItineraryForm({ onSubmit, isLoading }: ItineraryFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      origin: "",
      destination: "",
      numberOfPeople: "1",
      budget: "Modest",
      style: "Peaceful",
      language: "Hindi",
    },
  });

  const onFormSubmit = (values: z.infer<typeof formSchema>) => {
    const formattedValues = {
      ...values,
      numberOfPeople: parseInt(values.numberOfPeople, 10)
    };
    onSubmit(formattedValues as TravelItineraryInput);
  };

  const departureDate = form.watch("departureDate");

  return (
    <div className="bg-white p-6 sm:p-8">
      <div className="mb-8">
        <h3 className="text-2xl font-black text-slate-800 mb-2">Sacred Intentions</h3>
        <p className="text-sm font-medium text-slate-400">Define your pilgrimage parameters</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="language"
            render={({ field }) => (
              <FormItem className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <Languages className="h-4 w-4 text-orange-500" />
                  <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-400">Response Language</FormLabel>
                </div>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex items-center space-x-6"
                    disabled={isLoading}
                  >
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="Hindi" className="border-orange-200 text-orange-600 focus:ring-orange-500" />
                      </FormControl>
                      <FormLabel className="font-bold text-sm text-slate-700">हिंदी (Hindi)</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="English" className="border-orange-200 text-orange-600 focus:ring-orange-500" />
                      </FormControl>
                      <FormLabel className="font-bold text-sm text-slate-700">English</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="origin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Starting Point</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                      <Input placeholder="e.g., Mumbai" className="pl-10 h-12 rounded-xl border-slate-100 focus:border-orange-500/50 bg-slate-50/50 font-medium" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="destination"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Holy Destination</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-400" />
                      <Input placeholder="e.g., Ujjain" className="pl-10 h-12 rounded-xl border-slate-100 focus:border-orange-500/50 bg-slate-50/50 font-medium" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="departureDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5">Arrival (Start)</FormLabel>
                  <Popover modal={true}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full h-12 rounded-xl border-slate-100 bg-slate-50/50 pl-3 text-left font-medium",
                            !field.value && "text-slate-400"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-slate-300" />
                          {field.value ? format(field.value, "PPP") : "Select date"}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="arrivalDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5">Departure (End)</FormLabel>
                  <Popover modal={true}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full h-12 rounded-xl border-slate-100 bg-slate-50/50 pl-3 text-left font-medium",
                            !field.value && "text-slate-400"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-slate-300" />
                          {field.value ? format(field.value, "PPP") : "Select date"}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => departureDate ? date <= departureDate : date < new Date(new Date().setHours(0, 0, 0, 0))}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="numberOfPeople"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Travelers</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                      <Input type="number" min="1" className="pl-10 h-12 rounded-xl border-slate-100 bg-slate-50/50 font-medium" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Financial Style</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                      <Input placeholder="e.g., Luxury, Modest" className="pl-10 h-12 rounded-xl border-slate-100 bg-slate-50/50 font-medium" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="style"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Journey Intent (Style)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-400" />
                    <Input placeholder="e.g., Peaceful, Historical, Devotional" className="pl-10 h-12 rounded-xl border-slate-100 bg-slate-50/50 font-medium" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 hover:shadow-lg hover:shadow-orange-500/20 text-white font-black text-sm uppercase tracking-widest transition-all active:scale-95"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-3 h-5 w-5 animate-spin" />
            ) : (
              <Bot className="mr-3 h-5 w-5" />
            )}
            {isLoading ? "Consulting AI..." : "Manifest Itinerary"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
