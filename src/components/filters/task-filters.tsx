import React from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { TaskFilters as FilterType } from '@/hooks/use-tasks';
interface TaskFiltersProps {
  filters: FilterType;
  setFilters: React.Dispatch<React.SetStateAction<FilterType>>;
}
export function TaskFilters({ filters, setFilters }: TaskFiltersProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };
  const handleTypeChange = (value: string) => {
    setFilters(prev => ({ ...prev, type: value as FilterType['type'] }));
  };
  const handleModeChange = (value: string) => {
    setFilters(prev => ({ ...prev, mode: value as FilterType['mode'] }));
  };
  const handleCreditsChange = (value: number[]) => {
    setFilters(prev => ({ ...prev, maxCredits: value[0] }));
  };
  const clearFilters = () => {
    setFilters({
      search: '',
      type: 'all',
      mode: 'all',
      minCredits: 0,
      maxCredits: 10,
    });
  };
  const activeFilterCount = [
    filters.type !== 'all',
    filters.mode !== 'all',
    filters.maxCredits !== 10,
  ].filter(Boolean).length;
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={filters.search}
            onChange={handleSearchChange}
            className="pl-9"
          />
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="sm:w-auto w-full">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-2 bg-chronos-teal text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filter Tasks</SheetTitle>
              <SheetDescription>
                Narrow down tasks by type, mode, and credits.
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-6 py-6">
              <div className="space-y-2">
                <Label>Task Type</Label>
                <Select value={filters.type} onValueChange={handleTypeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="offer">Offers (I can help)</SelectItem>
                    <SelectItem value="request">Requests (I need help)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Location Mode</Label>
                <Select value={filters.mode} onValueChange={handleModeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Mode</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="in_person">In Person</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Label>Max Credits</Label>
                  <span className="text-sm text-muted-foreground">{filters.maxCredits} credits</span>
                </div>
                <Slider
                  value={[filters.maxCredits]}
                  min={1}
                  max={20}
                  step={1}
                  onValueChange={handleCreditsChange}
                />
              </div>
            </div>
            <SheetFooter className="flex-col sm:flex-col gap-2">
              <SheetClose asChild>
                <Button type="submit" className="w-full bg-chronos-teal hover:bg-chronos-teal/90 text-white">
                  Apply Filters
                </Button>
              </SheetClose>
              <Button 
                variant="ghost" 
                onClick={clearFilters}
                className="w-full"
                disabled={activeFilterCount === 0 && !filters.search}
              >
                Clear All
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.type !== 'all' && (
            <Button variant="secondary" size="sm" onClick={() => handleTypeChange('all')} className="h-7 text-xs">
              Type: {filters.type}
              <X className="ml-1 h-3 w-3" />
            </Button>
          )}
          {filters.mode !== 'all' && (
            <Button variant="secondary" size="sm" onClick={() => handleModeChange('all')} className="h-7 text-xs">
              Mode: {filters.mode}
              <X className="ml-1 h-3 w-3" />
            </Button>
          )}
          {filters.maxCredits !== 10 && (
            <Button variant="secondary" size="sm" onClick={() => handleCreditsChange([10])} className="h-7 text-xs">
              Max Credits: {filters.maxCredits}
              <X className="ml-1 h-3 w-3" />
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs text-muted-foreground hover:text-foreground">
            Reset
          </Button>
        </div>
      )}
    </div>
  );
}