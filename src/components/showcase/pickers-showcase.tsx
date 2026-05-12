'use client'

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon, Clock, Info } from "lucide-react"
import { DatePicker } from "@/components/pickers/date-picker"
import { DateTimePicker } from "@/components/pickers/date-time-picker"
import { TimePicker } from "@/components/pickers/time-picker"
import { IMSDateTimePicker } from "@/components/pickers/ims-date-time-picker"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

export function PickersShowcase() {
  // DatePicker states
  const [dateValue, setDateValue] = React.useState<Date | undefined>(new Date())
  const [dateRestricted, setDateRestricted] = React.useState<Date | undefined>(undefined)

  // DateTimePicker states
  const [dt24h, setDt24h] = React.useState<Date | undefined>(undefined)
  const [dt12h, setDt12h] = React.useState<Date | undefined>(undefined)
  const [dtSeconds, setDtSeconds] = React.useState<Date | undefined>(undefined)

  // TimePicker states
  const [timeValue, setTimeValue] = React.useState<string | undefined>("09:30")
  const [timeQuickSelect, setTimeQuickSelect] = React.useState<string | undefined>(undefined)
  const [time12h, setTime12h] = React.useState<string | undefined>(undefined)

  // IMSDateTimePicker states
  const [imsInline, setImsInline] = React.useState<Date | undefined>(new Date())
  const [imsPopover, setImsPopover] = React.useState<Date | undefined>(undefined)
  const [imsRestricted, setImsRestricted] = React.useState<Date | undefined>(undefined)
  const [imsSideBySide, setImsSideBySide] = React.useState<Date | undefined>(undefined)

  // Computed date boundaries for restricted pickers
  const today = new Date()
  const minDate = new Date(today.getFullYear(), today.getMonth(), 1)
  const maxDate = new Date(today.getFullYear(), today.getMonth() + 3, 0)
  const disabledDates = [
    new Date(today.getFullYear(), today.getMonth(), 15),
    new Date(today.getFullYear(), today.getMonth(), 16),
    new Date(today.getFullYear(), today.getMonth(), 17),
  ]

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2 className="text-2xl font-bold text-navy-700 dark:text-navy-200">
          Pickers Module
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Replaces Bootstrap DateTimepicker CSS — DatePicker, DateTimePicker, TimePicker, and IMSDateTimePicker components with Deep Navy Blue theme
        </p>
      </div>

      <Separator className="bg-navy-200 dark:bg-navy-700" />

      {/* ===== DATE PICKER SECTION ===== */}
      <Card className="border-navy-200 dark:border-navy-700">
        <CardHeader className="bg-gradient-to-r from-navy-600 to-navy-700 text-white rounded-t-lg -m-6 mb-0 p-6">
          <CardTitle className="flex items-center gap-2 text-white">
            <CalendarIcon className="h-5 w-5" />
            DatePicker
          </CardTitle>
          <CardDescription className="text-navy-100">
            Replaces <code className="bg-navy-800/50 px-1 rounded text-xs">bootstrap-datetimepicker date mode</code> — Navy Blue theme with selected days and today indicator
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Basic DatePicker with Navy Blue theme */}
          <div>
            <h3 className="text-sm font-semibold text-navy-700 dark:text-navy-300 mb-1">
              Basic DatePicker
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Select a date with Navy Blue selected day and today ring indicator. Clear button enabled.
            </p>
            <div className="max-w-xs">
              <DatePicker
                value={dateValue}
                onChange={setDateValue}
                placeholder="Select order date"
                formatStr="dd/MM/yyyy"
                showClear={true}
              />
              {dateValue && (
                <p className="text-xs text-navy-600 dark:text-navy-400 mt-1.5">
                  Selected: {format(dateValue, "dd/MM/yyyy")}
                </p>
              )}
            </div>
          </div>

          <Separator className="bg-navy-100 dark:bg-navy-800" />

          {/* DatePicker with min/max date */}
          <div>
            <h3 className="text-sm font-semibold text-navy-700 dark:text-navy-300 mb-1">
              DatePicker with Min/Max Date Restrictions
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Only dates within the next 3 months are selectable. Dates outside range appear disabled with strikethrough.
            </p>
            <div className="max-w-xs">
              <DatePicker
                value={dateRestricted}
                onChange={setDateRestricted}
                placeholder="Select delivery date"
                minDate={minDate}
                maxDate={maxDate}
                showClear={true}
              />
              {dateRestricted && (
                <p className="text-xs text-navy-600 dark:text-navy-400 mt-1.5">
                  Selected: {format(dateRestricted, "dd/MM/yyyy")}
                </p>
              )}
            </div>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline" className="text-xs border-navy-300 text-navy-600 dark:border-navy-600 dark:text-navy-400">
                Min: {format(minDate, "dd/MM/yyyy")}
              </Badge>
              <Badge variant="outline" className="text-xs border-navy-300 text-navy-600 dark:border-navy-600 dark:text-navy-400">
                Max: {format(maxDate, "dd/MM/yyyy")}
              </Badge>
            </div>
          </div>

          <Separator className="bg-navy-100 dark:bg-navy-800" />

          {/* Disabled DatePicker */}
          <div>
            <h3 className="text-sm font-semibold text-navy-700 dark:text-navy-300 mb-1">
              Disabled State
            </h3>
            <div className="max-w-xs">
              <DatePicker
                value={new Date()}
                onChange={() => {}}
                placeholder="Disabled date picker"
                disabled={true}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator className="bg-navy-200 dark:bg-navy-700" />

      {/* ===== DATE TIME PICKER SECTION ===== */}
      <Card className="border-navy-200 dark:border-navy-700">
        <CardHeader className="bg-gradient-to-r from-navy-600 to-navy-700 text-white rounded-t-lg -m-6 mb-0 p-6">
          <CardTitle className="flex items-center gap-2 text-white">
            <CalendarIcon className="h-5 w-5" />
            DateTimePicker
          </CardTitle>
          <CardDescription className="text-navy-100">
            Replaces <code className="bg-navy-800/50 px-1 rounded text-xs">bootstrap-datetimepicker datetime mode</code> — Calendar + Time spinner with 12h/24h format support
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 24-hour format */}
            <div>
              <h3 className="text-sm font-semibold text-navy-700 dark:text-navy-300 mb-1">
                24-Hour Format (Default)
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                Standard 24-hour time display with hours and minutes spinners. Now button for quick current time.
              </p>
              <div>
                <DateTimePicker
                  value={dt24h}
                  onChange={setDt24h}
                  placeholder="Select date & time (24h)"
                  dateFormat="dd/MM/yyyy HH:mm"
                  hour12={false}
                  showClear={true}
                />
                {dt24h && (
                  <p className="text-xs text-navy-600 dark:text-navy-400 mt-1.5">
                    Selected: {format(dt24h, "dd/MM/yyyy HH:mm")}
                  </p>
                )}
              </div>
            </div>

            {/* 12-hour format */}
            <div>
              <h3 className="text-sm font-semibold text-navy-700 dark:text-navy-300 mb-1">
                12-Hour Format (AM/PM)
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                12-hour display with AM/PM toggle button. Uses <code className="bg-navy-50 dark:bg-navy-900 px-1 rounded text-xs">hour12=true</code>.
              </p>
              <div>
                <DateTimePicker
                  value={dt12h}
                  onChange={setDt12h}
                  placeholder="Select date & time (12h)"
                  dateFormat="dd/MM/yyyy hh:mm a"
                  hour12={true}
                  showClear={true}
                />
                {dt12h && (
                  <p className="text-xs text-navy-600 dark:text-navy-400 mt-1.5">
                    Selected: {format(dt12h, "dd/MM/yyyy hh:mm a")}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator className="bg-navy-100 dark:bg-navy-800" />

          {/* With seconds */}
          <div>
            <h3 className="text-sm font-semibold text-navy-700 dark:text-navy-300 mb-1">
              With Seconds Display
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Shows hours, minutes, and seconds spinners using <code className="bg-navy-50 dark:bg-navy-900 px-1 rounded text-xs">showSeconds=true</code>.
            </p>
            <div className="max-w-xs">
              <DateTimePicker
                value={dtSeconds}
                onChange={setDtSeconds}
                placeholder="Select with seconds"
                dateFormat="dd/MM/yyyy HH:mm:ss"
                showSeconds={true}
                hour12={false}
                showClear={true}
              />
              {dtSeconds && (
                <p className="text-xs text-navy-600 dark:text-navy-400 mt-1.5">
                  Selected: {format(dtSeconds, "dd/MM/yyyy HH:mm:ss")}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator className="bg-navy-200 dark:bg-navy-700" />

      {/* ===== TIME PICKER SECTION ===== */}
      <Card className="border-navy-200 dark:border-navy-700">
        <CardHeader className="bg-gradient-to-r from-navy-600 to-navy-700 text-white rounded-t-lg -m-6 mb-0 p-6">
          <CardTitle className="flex items-center gap-2 text-white">
            <Clock className="h-5 w-5" />
            TimePicker
          </CardTitle>
          <CardDescription className="text-navy-100">
            Replaces <code className="bg-navy-800/50 px-1 rounded text-xs">bootstrap-datetimepicker time mode</code> — Hour/minute/second spinners with quick select and AM/PM
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic TimePicker */}
            <div>
              <h3 className="text-sm font-semibold text-navy-700 dark:text-navy-300 mb-1">
                Basic TimePicker (24h)
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                24-hour format with hours and minutes spinners. Value format: &quot;HH:mm&quot;.
              </p>
              <div>
                <TimePicker
                  value={timeValue}
                  onChange={setTimeValue}
                  placeholder="Select time"
                  hour12={false}
                  showClear={true}
                />
                {timeValue && (
                  <p className="text-xs text-navy-600 dark:text-navy-400 mt-1.5">
                    Selected: {timeValue}
                  </p>
                )}
              </div>
            </div>

            {/* TimePicker with 12h format */}
            <div>
              <h3 className="text-sm font-semibold text-navy-700 dark:text-navy-300 mb-1">
                12-Hour Format (AM/PM)
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                12-hour format with AM/PM toggle. Display shows period suffix.
              </p>
              <div>
                <TimePicker
                  value={time12h}
                  onChange={setTime12h}
                  placeholder="Select time (12h)"
                  hour12={true}
                  showClear={true}
                />
                {time12h && (
                  <p className="text-xs text-navy-600 dark:text-navy-400 mt-1.5">
                    Selected: {time12h}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator className="bg-navy-100 dark:bg-navy-800" />

          {/* TimePicker with Quick Select */}
          <div>
            <h3 className="text-sm font-semibold text-navy-700 dark:text-navy-300 mb-1">
              Quick Select Time Slots
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Uses <code className="bg-navy-50 dark:bg-navy-900 px-1 rounded text-xs">interval=15</code> to show quick select buttons for 15-minute intervals. 
              Great for scheduling delivery windows or appointment times in ERP.
            </p>
            <div className="max-w-xs">
              <TimePicker
                value={timeQuickSelect}
                onChange={setTimeQuickSelect}
                placeholder="Select delivery slot"
                interval={15}
                hour12={false}
                showClear={true}
              />
              {timeQuickSelect && (
                <p className="text-xs text-navy-600 dark:text-navy-400 mt-1.5">
                  Selected Slot: {timeQuickSelect}
                </p>
              )}
            </div>
          </div>

          <Separator className="bg-navy-100 dark:bg-navy-800" />

          {/* TimePicker with seconds */}
          <div>
            <h3 className="text-sm font-semibold text-navy-700 dark:text-navy-300 mb-1">
              With Seconds
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Adds seconds spinner for precision time entry. Value format: &quot;HH:mm:ss&quot;.
            </p>
            <div className="max-w-xs">
              <TimePicker
                value="14:30:45"
                onChange={() => {}}
                placeholder="Select precise time"
                showSeconds={true}
                hour12={false}
                showClear={false}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator className="bg-navy-200 dark:bg-navy-700" />

      {/* ===== IMS DATE TIME PICKER SECTION ===== */}
      <Card className="border-navy-200 dark:border-navy-700">
        <CardHeader className="bg-gradient-to-r from-navy-600 to-navy-700 text-white rounded-t-lg -m-6 mb-0 p-6">
          <CardTitle className="flex items-center gap-2 text-white">
            <Info className="h-5 w-5" />
            IMSDateTimePicker
          </CardTitle>
          <CardDescription className="text-navy-100">
            Comprehensive replacement for <code className="bg-navy-800/50 px-1 rounded text-xs">bootstrap-datetimepicker</code> — Full API with inline/popover modes, min/max dates, disabled dates, time restrictions, toolbar, and view modes
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Inline mode */}
          <div>
            <h3 className="text-sm font-semibold text-navy-700 dark:text-navy-300 mb-1">
              Inline Mode (Always Visible)
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Uses <code className="bg-navy-50 dark:bg-navy-900 px-1 rounded text-xs">inline=true</code> — the calendar is always visible without a popover. 
              Ideal for dashboard date selection or booking systems.
            </p>
            <div className="border border-navy-200 dark:border-navy-700 rounded-lg p-4 bg-white dark:bg-navy-900 inline-block">
              <IMSDateTimePicker
                value={imsInline}
                onChange={setImsInline}
                format="dd/MM/yyyy HH:mm"
                inline={true}
                showTodayButton={true}
                showClear={true}
              />
            </div>
            {imsInline && (
              <p className="text-xs text-navy-600 dark:text-navy-400 mt-2">
                Inline Selected: {format(imsInline, "dd/MM/yyyy HH:mm")}
              </p>
            )}
          </div>

          <Separator className="bg-navy-100 dark:bg-navy-800" />

          {/* Popover mode */}
          <div>
            <h3 className="text-sm font-semibold text-navy-700 dark:text-navy-300 mb-1">
              Popover Mode (Default)
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Standard popover trigger. Click to open the datetime picker. Supports all toolbar buttons: Today, Clear, Close.
            </p>
            <div className="max-w-xs">
              <IMSDateTimePicker
                value={imsPopover}
                onChange={setImsPopover}
                format="dd/MM/yyyy HH:mm"
                placeholder="Select invoice date"
                showTodayButton={true}
                showClear={true}
                showClose={true}
              />
              {imsPopover && (
                <p className="text-xs text-navy-600 dark:text-navy-400 mt-1.5">
                  Popover Selected: {format(imsPopover, "dd/MM/yyyy HH:mm")}
                </p>
              )}
            </div>
          </div>

          <Separator className="bg-navy-100 dark:bg-navy-800" />

          {/* Min/Max dates and disabled dates */}
          <div>
            <h3 className="text-sm font-semibold text-navy-700 dark:text-navy-300 mb-1">
              Min/Max Dates + Disabled Dates + Disabled Weekends
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Restricts selection with <code className="bg-navy-50 dark:bg-navy-900 px-1 rounded text-xs">minDate</code>, <code className="bg-navy-50 dark:bg-navy-900 px-1 rounded text-xs">maxDate</code>, 
              specific <code className="bg-navy-50 dark:bg-navy-900 px-1 rounded text-xs">disabledDates</code> (shown with strikethrough), 
              and <code className="bg-navy-50 dark:bg-navy-900 px-1 rounded text-xs">daysOfWeekDisabled</code> (weekends: Saturday &amp; Sunday).
            </p>
            <div className="max-w-xs">
              <IMSDateTimePicker
                value={imsRestricted}
                onChange={setImsRestricted}
                format="dd/MM/yyyy"
                placeholder="Select business day"
                minDate={minDate}
                maxDate={maxDate}
                disabledDates={disabledDates}
                daysOfWeekDisabled={[0, 6]}
                showTodayButton={true}
                showClear={true}
              />
              {imsRestricted && (
                <p className="text-xs text-navy-600 dark:text-navy-400 mt-1.5">
                  Restricted Selected: {format(imsRestricted, "dd/MM/yyyy")}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline" className="text-xs border-amber-300 text-amber-600 dark:border-amber-600 dark:text-amber-400">
                Disabled: 15th–17th
              </Badge>
              <Badge variant="outline" className="text-xs border-amber-300 text-amber-600 dark:border-amber-600 dark:text-amber-400">
                No Weekends
              </Badge>
              <Badge variant="outline" className="text-xs border-navy-300 text-navy-600 dark:border-navy-600 dark:text-navy-400">
                Min: {format(minDate, "dd/MM/yyyy")}
              </Badge>
              <Badge variant="outline" className="text-xs border-navy-300 text-navy-600 dark:border-navy-600 dark:text-navy-400">
                Max: {format(maxDate, "dd/MM/yyyy")}
              </Badge>
            </div>
          </div>

          <Separator className="bg-navy-100 dark:bg-navy-800" />

          {/* Side by side mode */}
          <div>
            <h3 className="text-sm font-semibold text-navy-700 dark:text-navy-300 mb-1">
              Side-by-Side Mode
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Uses <code className="bg-navy-50 dark:bg-navy-900 px-1 rounded text-xs">sideBySide=true</code> — Calendar and time picker displayed alongside each other. 
              Best for wide forms where both date and time selection are equally important.
            </p>
            <div className="max-w-xs">
              <IMSDateTimePicker
                value={imsSideBySide}
                onChange={setImsSideBySide}
                format="dd/MM/yyyy HH:mm"
                placeholder="Select date & time"
                sideBySide={true}
                showTodayButton={true}
                showClear={true}
              />
              {imsSideBySide && (
                <p className="text-xs text-navy-600 dark:text-navy-400 mt-1.5">
                  SideBySide Selected: {format(imsSideBySide, "dd/MM/yyyy HH:mm")}
                </p>
              )}
            </div>
          </div>

          <Separator className="bg-navy-100 dark:bg-navy-800" />

          {/* Time restrictions */}
          <div>
            <h3 className="text-sm font-semibold text-navy-700 dark:text-navy-300 mb-1">
              Time Restrictions (Stepping + Disabled Hours)
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              <code className="bg-navy-50 dark:bg-navy-900 px-1 rounded text-xs">stepping=15</code> snaps minutes to 15-minute intervals. 
              <code className="bg-navy-50 dark:bg-navy-900 px-1 rounded text-xs">disabledHours</code> prevents selection of non-business hours (before 8am and after 6pm).
            </p>
            <div className="max-w-xs">
              <IMSDateTimePicker
                format="dd/MM/yyyy hh:mm a"
                placeholder="Select business hours"
                stepping={15}
                disabledHours={[0, 1, 2, 3, 4, 5, 6, 7, 18, 19, 20, 21, 22, 23]}
                showTodayButton={true}
                showClear={true}
              />
            </div>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline" className="text-xs border-emerald-300 text-emerald-600 dark:border-emerald-600 dark:text-emerald-400">
                15-min Stepping
              </Badge>
              <Badge variant="outline" className="text-xs border-amber-300 text-amber-600 dark:border-amber-600 dark:text-amber-400">
                Hours: 08:00–17:59 Only
              </Badge>
            </div>
          </div>

          <Separator className="bg-navy-100 dark:bg-navy-800" />

          {/* View modes */}
          <div>
            <h3 className="text-sm font-semibold text-navy-700 dark:text-navy-300 mb-1">
              Calendar View Modes (Days → Months → Years → Decades)
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Click the month/year header to navigate between views. Supports <code className="bg-navy-50 dark:bg-navy-900 px-1 rounded text-xs">viewMode</code> 
              prop to start in a specific view. Also supports <code className="bg-navy-50 dark:bg-navy-900 px-1 rounded text-xs">calendarWeeks</code> for ISO week numbers.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-navy-600 dark:text-navy-400 mb-1.5">Year View Mode (start in years)</p>
                <IMSDateTimePicker
                  format="MM/yyyy"
                  placeholder="Select month/year"
                  viewMode="years"
                  showClear={true}
                />
              </div>
              <div>
                <p className="text-xs font-medium text-navy-600 dark:text-navy-400 mb-1.5">With Calendar Weeks</p>
                <IMSDateTimePicker
                  format="dd/MM/yyyy"
                  placeholder="Select date with week#"
                  calendarWeeks={true}
                  showTodayButton={true}
                  showClear={true}
                />
              </div>
            </div>
          </div>

          <Separator className="bg-navy-100 dark:bg-navy-800" />

          {/* 12-hour AM/PM format */}
          <div>
            <h3 className="text-sm font-semibold text-navy-700 dark:text-navy-300 mb-1">
              12-Hour AM/PM Format
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Uses <code className="bg-navy-50 dark:bg-navy-900 px-1 rounded text-xs">format=&quot;dd/MM/yyyy hh:mm a&quot;</code> — the &quot;a&quot; token enables 12-hour mode 
              with AM/PM toggle button. Navy Blue styled period switcher.
            </p>
            <div className="max-w-xs">
              <IMSDateTimePicker
                format="dd/MM/yyyy hh:mm a"
                placeholder="Select (12h AM/PM)"
                showTodayButton={true}
                showClear={true}
                toolbarPlacement="top"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
