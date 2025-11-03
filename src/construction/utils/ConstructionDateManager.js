/**
 * 🗓️ CONSTRUCTION DATE MANAGER - TOP 1% EXPERT IMPLEMENTATION
 * ==========================================================
 * 
 * HOAI-compliant timeline calculations with German working days support.
 * Handles all date calculations for construction projects including:
 * - Working days calculation (excluding weekends/holidays)
 * - German federal and state holiday support
 * - Buffer time calculations
 * - HOAI phase duration compliance
 * - Realistic scheduling with contingencies
 * 
 * @author Elite Construction AI Syndicate
 * @version 1.0.0
 */

import { EventEmitter } from 'events';

export class ConstructionDateManager extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            defaultBufferPercentage: config.defaultBufferPercentage || 0.1, // 10% buffer
            workingHoursPerDay: config.workingHoursPerDay || 8,
            includeStateHolidays: config.includeStateHolidays || true,
            germanState: config.germanState || 'BY', // Bayern default
            ...config
        };
        
        // German federal holidays (fixed and variable)
        this.federalHolidays = {
            fixed: [
                { month: 1, day: 1, name: 'Neujahr' },
                { month: 5, day: 1, name: 'Tag der Arbeit' },
                { month: 10, day: 3, name: 'Tag der Deutschen Einheit' },
                { month: 12, day: 25, name: '1. Weihnachtstag' },
                { month: 12, day: 26, name: '2. Weihnachtstag' }
            ],
            // Variable holidays will be calculated based on Easter
            variable: [
                'Karfreitag', // Good Friday
                'Ostermontag', // Easter Monday
                'Christi Himmelfahrt', // Ascension Day
                'Pfingstmontag', // Whit Monday
                'Fronleichnam' // Corpus Christi (only some states)
            ]
        };
        
        // State-specific holidays
        this.stateHolidays = {
            'BY': [ // Bayern
                { month: 1, day: 6, name: 'Heilige Drei Könige' },
                { month: 11, day: 1, name: 'Allerheiligen' }
            ],
            'BW': [ // Baden-Württemberg
                { month: 1, day: 6, name: 'Heilige Drei Könige' },
                { month: 11, day: 1, name: 'Allerheiligen' }
            ],
            // Add more states as needed
        };
        
        // HOAI standard phase durations (in weeks)
        this.hoaiPhaseDurations = {
            'LP1': 1,  // Grundlagenermittlung
            'LP2': 2,  // Vorplanung
            'LP3': 4,  // Entwurfsplanung
            'LP4': 2,  // Genehmigungsplanung
            'LP5': 6,  // Ausführungsplanung
            'LP6': 3,  // Vorbereitung der Vergabe
            'LP7': 2,  // Mitwirkung bei der Vergabe
            'LP8': 0,  // Objektüberwachung (duration depends on construction)
            'LP9': 1   // Objektbetreuung
        };
        
        // Cache for holiday calculations
        this.holidayCache = new Map();
    }
    
    /**
     * Calculate project timeline based on start date
     */
    calculateProjectTimeline(projectStartDate, phases = ['LP6', 'LP7']) {
        const startDate = new Date(projectStartDate);
        const timeline = {
            projectStart: startDate,
            phases: [],
            milestones: [],
            totalDuration: 0,
            workingDays: 0,
            calendarDays: 0
        };
        
        let currentDate = new Date(startDate);
        
        // Calculate each phase
        for (const phase of phases) {
            const phaseDuration = this.hoaiPhaseDurations[phase] || 2;
            const phaseWorkingDays = phaseDuration * 5; // 5 working days per week
            
            const phaseEnd = this.addWorkingDays(currentDate, phaseWorkingDays);
            
            timeline.phases.push({
                phase: phase,
                name: this.getPhaseName(phase),
                startDate: new Date(currentDate),
                endDate: phaseEnd,
                durationWeeks: phaseDuration,
                workingDays: phaseWorkingDays,
                calendarDays: this.getCalendarDaysBetween(currentDate, phaseEnd)
            });
            
            currentDate = phaseEnd;
        }
        
        // Calculate milestones
        timeline.milestones = this.calculateMilestones(timeline.phases);
        
        // Summary
        timeline.totalDuration = timeline.phases.reduce((sum, p) => sum + p.durationWeeks, 0);
        timeline.workingDays = timeline.phases.reduce((sum, p) => sum + p.workingDays, 0);
        timeline.calendarDays = this.getCalendarDaysBetween(startDate, currentDate);
        timeline.projectEnd = currentDate;
        
        return timeline;
    }
    
    /**
     * Generate Vergabeterminplan (tender schedule) with dynamic dates
     */
    generateVergabeterminplan(projectStartDate) {
        const startDate = new Date(projectStartDate || Date.now());
        
        // Define tender phases with durations
        const tenderPhases = [
            { name: 'Bekanntmachung', duration: 0, type: 'milestone' },
            { name: 'Angebotsphase', duration: 20, type: 'phase' }, // 4 weeks standard
            { name: 'Angebotsfrist', duration: 0, type: 'milestone' },
            { name: 'Prüfung und Wertung', duration: 10, type: 'phase' }, // 2 weeks
            { name: 'Zuschlagsentscheidung', duration: 5, type: 'phase' }, // 1 week
            { name: 'Zuschlagserteilung', duration: 0, type: 'milestone' },
            { name: 'Vertragsvorbereitung', duration: 5, type: 'phase' }, // 1 week
            { name: 'Vertragsunterzeichnung', duration: 0, type: 'milestone' }
        ];
        
        const schedule = {
            projectId: null, // Will be set by caller
            startDate: startDate,
            phases: [],
            milestones: [],
            criticalDates: []
        };
        
        let currentDate = new Date(startDate);
        
        tenderPhases.forEach((phase, index) => {
            if (phase.type === 'phase') {
                const endDate = this.addWorkingDays(currentDate, phase.duration);
                
                schedule.phases.push({
                    phase: `Vergabe_${index}`,
                    name: phase.name,
                    startDate: new Date(currentDate),
                    endDate: endDate,
                    durationDays: phase.duration,
                    workingDays: phase.duration,
                    calendarDays: this.getCalendarDaysBetween(currentDate, endDate),
                    bufferIncluded: true
                });
                
                currentDate = endDate;
            } else {
                schedule.milestones.push({
                    name: phase.name,
                    date: new Date(currentDate),
                    type: 'tender_milestone',
                    critical: phase.name.includes('frist') || phase.name.includes('Zuschlag')
                });
            }
        });
        
        // Add critical dates for legal compliance
        schedule.criticalDates = [
            {
                name: 'Mindestangebotsfrist',
                date: this.addWorkingDays(startDate, 15), // VOB/A minimum
                type: 'legal_requirement',
                description: 'Mindestfrist gemäß VOB/A'
            },
            {
                name: 'Bindefrist',
                date: this.addWorkingDays(schedule.milestones.find(m => m.name === 'Angebotsfrist').date, 30),
                type: 'legal_requirement',
                description: 'Bindefrist für Bieter (30 Tage)'
            }
        ];
        
        return schedule;
    }
    
    /**
     * Add working days to a date (excluding weekends and holidays)
     */
    addWorkingDays(startDate, workingDays) {
        const date = new Date(startDate);
        let daysAdded = 0;
        
        while (daysAdded < workingDays) {
            date.setDate(date.getDate() + 1);
            
            if (this.isWorkingDay(date)) {
                daysAdded++;
            }
        }
        
        return date;
    }
    
    /**
     * Add calendar weeks to a date
     */
    addWeeks(startDate, weeks) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + (weeks * 7));
        return date;
    }
    
    /**
     * Check if a date is a working day
     */
    isWorkingDay(date) {
        // Check if weekend
        const dayOfWeek = date.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            return false;
        }
        
        // Check if holiday
        if (this.isHoliday(date)) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Check if a date is a German holiday
     */
    isHoliday(date) {
        const year = date.getFullYear();
        const holidays = this.getHolidaysForYear(year);
        
        return holidays.some(holiday => 
            holiday.getDate() === date.getDate() &&
            holiday.getMonth() === date.getMonth() &&
            holiday.getFullYear() === date.getFullYear()
        );
    }
    
    /**
     * Get all holidays for a specific year
     */
    getHolidaysForYear(year) {
        const cacheKey = `${year}-${this.config.germanState}`;
        
        if (this.holidayCache.has(cacheKey)) {
            return this.holidayCache.get(cacheKey);
        }
        
        const holidays = [];
        
        // Add fixed holidays
        this.federalHolidays.fixed.forEach(holiday => {
            holidays.push(new Date(year, holiday.month - 1, holiday.day));
        });
        
        // Add state-specific holidays
        if (this.config.includeStateHolidays && this.stateHolidays[this.config.germanState]) {
            this.stateHolidays[this.config.germanState].forEach(holiday => {
                holidays.push(new Date(year, holiday.month - 1, holiday.day));
            });
        }
        
        // Add variable holidays (Easter-based)
        const easter = this.calculateEaster(year);
        holidays.push(
            this.addDays(easter, -2), // Karfreitag
            this.addDays(easter, 1),  // Ostermontag
            this.addDays(easter, 39), // Christi Himmelfahrt
            this.addDays(easter, 50)  // Pfingstmontag
        );
        
        // Fronleichnam (only in some states)
        if (['BY', 'BW', 'HE', 'NW', 'RP', 'SL'].includes(this.config.germanState)) {
            holidays.push(this.addDays(easter, 60));
        }
        
        this.holidayCache.set(cacheKey, holidays);
        return holidays;
    }
    
    /**
     * Calculate Easter date using Gauss algorithm
     */
    calculateEaster(year) {
        const a = year % 19;
        const b = Math.floor(year / 100);
        const c = year % 100;
        const d = Math.floor(b / 4);
        const e = b % 4;
        const f = Math.floor((b + 8) / 25);
        const g = Math.floor((b - f + 1) / 3);
        const h = (19 * a + b - d - g + 15) % 30;
        const i = Math.floor(c / 4);
        const k = c % 4;
        const l = (32 + 2 * e + 2 * i - h - k) % 7;
        const m = Math.floor((a + 11 * h + 22 * l) / 451);
        const month = Math.floor((h + l - 7 * m + 114) / 31);
        const day = ((h + l - 7 * m + 114) % 31) + 1;
        
        return new Date(year, month - 1, day);
    }
    
    /**
     * Add days to a date
     */
    addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }
    
    /**
     * Get calendar days between two dates
     */
    getCalendarDaysBetween(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }
    
    /**
     * Get working days between two dates
     */
    getWorkingDaysBetween(startDate, endDate) {
        let workingDays = 0;
        const current = new Date(startDate);
        const end = new Date(endDate);
        
        while (current <= end) {
            if (this.isWorkingDay(current)) {
                workingDays++;
            }
            current.setDate(current.getDate() + 1);
        }
        
        return workingDays;
    }
    
    /**
     * Calculate milestones based on phases
     */
    calculateMilestones(phases) {
        const milestones = [];
        
        // Project start
        if (phases.length > 0) {
            milestones.push({
                name: 'Projektstart',
                date: phases[0].startDate,
                type: 'project_start'
            });
        }
        
        // Phase transitions
        phases.forEach((phase, index) => {
            if (phase.phase === 'LP6') {
                milestones.push({
                    name: 'Ausschreibungsunterlagen fertig',
                    date: phase.endDate,
                    type: 'deliverable'
                });
            }
            
            if (phase.phase === 'LP7') {
                milestones.push({
                    name: 'Vergabeentscheidung',
                    date: this.addWorkingDays(phase.startDate, 15),
                    type: 'decision'
                });
            }
        });
        
        // Project end
        if (phases.length > 0) {
            milestones.push({
                name: 'Vergabeverfahren abgeschlossen',
                date: phases[phases.length - 1].endDate,
                type: 'project_end'
            });
        }
        
        return milestones;
    }
    
    /**
     * Get HOAI phase name
     */
    getPhaseName(phaseCode) {
        const phaseNames = {
            'LP1': 'Grundlagenermittlung',
            'LP2': 'Vorplanung',
            'LP3': 'Entwurfsplanung',
            'LP4': 'Genehmigungsplanung',
            'LP5': 'Ausführungsplanung',
            'LP6': 'Vorbereitung der Vergabe',
            'LP7': 'Mitwirkung bei der Vergabe',
            'LP8': 'Objektüberwachung',
            'LP9': 'Objektbetreuung'
        };
        
        return phaseNames[phaseCode] || phaseCode;
    }
    
    /**
     * Add buffer time to a duration
     */
    addBuffer(duration, bufferPercentage = null) {
        const buffer = bufferPercentage || this.config.defaultBufferPercentage;
        return Math.ceil(duration * (1 + buffer));
    }
    
    /**
     * Format date for German locale
     */
    formatDateGerman(date) {
        const options = { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit' 
        };
        return new Date(date).toLocaleDateString('de-DE', options);
    }
    
    /**
     * Calculate realistic schedule with contingencies
     */
    calculateRealisticSchedule(idealSchedule, riskFactors = {}) {
        const schedule = JSON.parse(JSON.stringify(idealSchedule)); // Deep copy
        
        // Apply risk factors
        const complexityFactor = riskFactors.complexity || 1.0;
        const weatherRisk = riskFactors.weatherRisk || 0;
        const resourceRisk = riskFactors.resourceRisk || 0;
        
        // Adjust phase durations
        schedule.phases.forEach(phase => {
            // Base adjustment for complexity
            phase.workingDays = Math.ceil(phase.workingDays * complexityFactor);
            
            // Add weather contingency (winter months)
            const startMonth = phase.startDate.getMonth();
            if ([11, 0, 1, 2].includes(startMonth)) { // Dec, Jan, Feb, Mar
                phase.workingDays = Math.ceil(phase.workingDays * (1 + weatherRisk));
            }
            
            // Add resource contingency
            phase.workingDays = Math.ceil(phase.workingDays * (1 + resourceRisk));
            
            // Recalculate end date
            phase.endDate = this.addWorkingDays(phase.startDate, phase.workingDays);
        });
        
        return schedule;
    }
}

// Export singleton instance
export const constructionDateManager = new ConstructionDateManager();

export default ConstructionDateManager;
