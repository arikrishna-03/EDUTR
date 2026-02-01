import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

// Configure the worker - crucial for pdfjs-dist 3/4+ in Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

/**
 * Parses the uploaded Academic Calendar PDF.
 * Assumes a grid with Date, Day, Event/Description.
 */
export const parseCalendarPDF = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    let allEvents = [];
    // Dynamic Mapping State
    const columnMapping = {}; // { 0: { month: 11, year: 2025 }, 1: { month: 0, year: 2026 } ... }
    const monthsShort = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    let defaultYear = new Date().getFullYear(); // Fallback
    let isJanJun = false;


    // First pass: Calculate content bounds to determine grid width accurately
    let minX = Infinity;
    let maxX = -Infinity;

    // We'll use a sample of items to determine the grid boundaries
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        textContent.items.forEach(item => {
            const str = item.str.trim();
            if (str.length > 0) {
                const lowerStr = str.toLowerCase();
                // Check for Jan/Feb/Mar to detect Jan-Jun semester
                if (lowerStr.includes('january') || lowerStr.includes('february') || lowerStr.includes('march')) {
                    isJanJun = true;
                }

                const x = item.transform[4];
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
            }
        });
    }

    // Safety check if empty
    if (minX === Infinity) { minX = 0; maxX = 600; } // default fallback

    if (isJanJun) {
        // This variable is not used anywhere else, and monthMapping was not declared.
        // It seems like this was an old logic that was replaced by columnMapping.
        // Keeping it commented out or removing it would be better.
        // monthMapping = [0, 1, 2, 3, 4, 5]; // Jan, Feb, Mar, Apr, May, Jun
    }

    const gridWidth = maxX - minX;
    const colWidth = gridWidth / 6;

    // Enhanced Header Detection Strategy:
    // 1. Cluster items by Y-coordinate to find the "Header Row".
    // 2. Identify Month Names in that row.
    // 3. Construct mapping from those months.

    let rowGroups = {};
    const Y_TOLERANCE_HEADER = 10;

    // Scan all items to group by Y (Row detection)
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        textContent.items.forEach(item => {
            // PDF Y coordinates: typically 0 at bottom. Higher Y = Top.
            // We want the TOPMOST rows.
            // Let's use a binned Y.
            const y = Math.round(item.transform[5]);
            // transform[5] is Y.

            // Find close y
            let foundY = Object.keys(rowGroups).find(key => Math.abs(key - y) < Y_TOLERANCE_HEADER);
            if (!foundY) {
                foundY = y;
                rowGroups[y] = [];
            }
            rowGroups[foundY].push({ str: item.str.trim(), x: item.transform[4] });
        });
    }

    // Sort rows by Y descending (Top first)
    const sortedRows = Object.keys(rowGroups).sort((a, b) => b - a);

    // Find header row: Look for row containing multiple Month Names
    const monthNamesDetailed = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
    const monthNamesAbbr = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

    let detectedMonthSequence = [];

    for (const y of sortedRows) {
        const items = rowGroups[y].sort((a, b) => a.x - b.x);
        let rowMonths = [];

        items.forEach(item => {
            const lower = item.str.toLowerCase().replace(/[^a-z]/g, '');
            // Check full names or abbr
            let mIndex = monthNamesDetailed.indexOf(lower);
            if (mIndex === -1 && lower.length >= 3) {
                mIndex = monthNamesAbbr.indexOf(lower.substring(0, 3));
            }

            if (mIndex !== -1) {
                // It's a month!
                // Look for year in the string "Dec-25" or "Dec 25"
                let yr = null;
                const yearMatch = item.str.match(/[- ']?(\d{2,4})$/);
                if (yearMatch) {
                    yr = parseInt(yearMatch[1]);
                    if (yr < 100) yr += 2000;
                }

                rowMonths.push({
                    month: mIndex,
                    year: yr,
                    x: item.x
                });
            }
        });

        // If we found at least 3 months in a row, assume it's the header row
        if (rowMonths.length >= 3) {
            detectedMonthSequence = rowMonths;
            break;
        }
    }

    // Determine bounds from headers or content
    if (minX === Infinity) { minX = 0; maxX = 600; }
    // Re-calc grid width based on headers if found? 
    // Or just map columns to the closest Month Header.

    // Map Columns to Months
    let currentYVal = defaultYear;

    if (detectedMonthSequence.length > 0) {
        // We have specific headers. 
        // We need to map grid columns (0-5) to these headers.
        // Assuming 6 columns uniformly distributed.
        const gWidth = maxX - minX;
        const cWidth = gWidth / 6;

        detectedMonthSequence.forEach(h => {
            const relativeX = h.x - minX;
            const colIdx = Math.floor((relativeX + 10) / cWidth); // +10 buffer

            if (colIdx >= 0 && colIdx <= 5) {
                let yr = h.year;
                if (!yr) {
                    // Infer: if month < prevMonth, year++
                    // But we need a base. Default to currentYear.
                    yr = currentYVal;
                    // Logic: If we have a sequence Dec, Jan... 
                    // We need to know start year.
                    // If explicit year found anywhere in sequence, anchor to it?
                    const anchor = detectedMonthSequence.find(dm => dm.year);
                    if (anchor) {
                        // Simple logic: if anchor is month M in year Y.
                        // This month is m. 
                        // Check diff.
                        // But simple increment logic is safer.
                    }
                }
                columnMapping[colIdx] = { month: h.month, year: yr || defaultYear };
            }
        });

        // Fix missing years by iterating
        let lastM = -1;
        let runningYear = defaultYear;
        // Search if any explicit year exists to set runningYear
        const firstExplicit = Object.values(columnMapping).find(v => v.year !== defaultYear);
        if (firstExplicit) runningYear = firstExplicit.year; // e.g. 2025

        // Recalculate years strictly based on rollovers
        const sortedCols = Object.keys(columnMapping).sort();
        if (sortedCols.length > 0) {
            let firstM = columnMapping[sortedCols[0]].month;
            // If first month is Dec (11) or Jan (0), try to guess context?
            // If user says "Dec-25", explicit year handles it.
            // If no explicit year, and we see Dec -> Jan -> Feb.
            // Dec is year X. Jan is year X+1.

            // Let's just pass through and fix rollovers
            sortedCols.forEach((c, idx) => {
                const m = columnMapping[c].month;
                if (columnMapping[c].year === defaultYear && idx > 0) { // If not explicit
                    const prevM = columnMapping[sortedCols[idx - 1]].month;
                    if (m < prevM) {
                        // Rollover
                        runningYear++;
                    }
                    columnMapping[c].year = runningYear;
                } else if (columnMapping[c].year) {
                    // Update running if explicit
                    runningYear = columnMapping[c].year;
                }
            });
        }
    } else {
        // FALLBACK: User mentioned "Jan-June" or "July-Dec"
        // But the image was "Dec-May".
        // Use "isJanJun" flag? 
        // If "December" was found in text, assume Dec- Start.
        // Let's look at the fallback variable I removed/commented.

        // Simple heuristic: 
        if (isJanJun) { // Detected "Jan", "Feb" etc.
            // Even Semester: Usually Dec, Jan, Feb, Mar, Apr, May
            // OR Jan, Feb, Mar, Apr, May, Jun
            // Check if "December" was in text?
            // Let's simpler: Default to Jan-Jun (0-5)
            // But if user meant Dec-May?
            // Let's map 0->Jan...
            [0, 1, 2, 3, 4, 5].forEach(i => columnMapping[i] = { month: i, year: defaultYear });
        } else {
            // Odd Semester: Jul-Dec
            [6, 7, 8, 9, 10, 11].forEach(i => columnMapping[i] = { month: i, year: defaultYear });
        }
    }

    // Second pass: Parse events
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const items = textContent.items;

        const rows = {};

        items.forEach(item => {
            const y = Math.round(item.transform[5] / 10) * 10;
            const x = item.transform[4];

            // Calculate relative X from the start of the grid
            const relativeX = x - minX;

            // Determine Column Index (0-5)
            // Use a small buffer to avoid edge cases at exact boundaries
            const colIndex = Math.floor((relativeX + 2) / colWidth);

            if (colIndex < 0 || colIndex > 5) return;

            if (!rows[y]) rows[y] = {};
            if (!rows[y][colIndex]) rows[y][colIndex] = [];

            rows[y][colIndex].push(item.str);
        });

        // Process grid cells
        Object.keys(rows).forEach(y => {
            Object.keys(rows[y]).forEach(colIndex => {
                const cellText = rows[y][colIndex].join(" ").trim();

                // Use Dynamic Mapping
                const mapping = columnMapping[parseInt(colIndex)];
                if (!mapping) return;

                const month = mapping.month;
                const year = mapping.year;

                const dateMatch = cellText.match(/^(\d{1,2})\b/);
                if (!dateMatch) return;

                const day = parseInt(dateMatch[1]);
                if (day < 1 || day > 31) return;

                // Cleaning Logic
                let cleanedText = cellText.replace(/^(\d{1,2})\b/, '').trim();
                cleanedText = cleanedText.replace(/\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*\b/gi, '').trim();
                cleanedText = cleanedText.replace(/Day\s*-\s*\d+/gi, '').trim();
                // Remove date ranges with dashes or dots (e.g. 22-12-2025 or 22.12.2025)
                cleanedText = cleanedText.replace(/(\d{1,2}[-.]\d{1,2}[-.]\d{2,4})\s*(to|-)?\s*(\d{1,2}[-.]\d{1,2}[-.]\d{2,4})?/gi, '').trim();
                // Remove specific noise phrases provided by user or common in academic cals
                cleanedText = cleanedText.replace(/Period\s*-\s*\(?\)?/gi, '').trim();
                cleanedText = cleanedText.replace(/[()]/g, '').trim(); // Remove parentheses if they remain

                const lowerText = cleanedText.toLowerCase();
                let eventType = null;

                // Strict Filtering based on User Request
                // Extended holiday list to catch specific festivals and breaks
                if (lowerText.includes('holiday') || lowerText.includes('festival') || lowerText.includes('pongal') ||
                    lowerText.includes('diwali') || lowerText.includes('deepavali') || lowerText.includes('christmas') ||
                    lowerText.includes('new year') || lowerText.includes('vacation') || lowerText.includes('jayanthi') ||
                    lowerText.includes('day') || // Catches Republic Day, Independence Day, May Day, etc.
                    lowerText.includes('eid') || lowerText.includes('ramzan') || lowerText.includes('bakrid') ||
                    lowerText.includes('muharram') || lowerText.includes('friday') || lowerText.includes('easter') ||
                    lowerText.includes('onam') || lowerText.includes('dussehra') || lowerText.includes('puja') ||
                    lowerText.includes('chaturthi') || lowerText.includes('krishna') || lowerText.includes('janmashtami') ||
                    lowerText.includes('leave')) {
                    eventType = 'holiday';
                } else if (lowerText.includes('cia') || lowerText.includes('internal') || lowerText.includes('assessment') || lowerText.includes('test')) {
                    eventType = 'cia';
                } else if (lowerText.includes('exam') || lowerText.includes('semester')) {
                    eventType = 'exam';
                } else if (lowerText.includes('committee') || lowerText.includes('meeting')) {
                    eventType = 'meeting'; // Class Committee Meeting
                } else if (lowerText.includes('time table') || lowerText.includes('timetable')) {
                    eventType = 'timetable';
                } else if (lowerText.includes('project') || lowerText.includes('mini')) {
                    eventType = 'project';
                } else if (lowerText.includes('lab')) {
                    eventType = 'lab';
                }

                if (eventType && cleanedText.length > 2) { // Allow short events like "CIA 1"
                    allEvents.push({
                        title: cleanedText,
                        day: day,
                        month: month,
                        year: year,
                        dateDisplay: `${day}`,
                        originalText: cellText,
                        type: eventType
                    });
                }
            });
        });
    }

    return allEvents;
};

export const parseCalendarImage = async (file) => {
    const result = await Tesseract.recognize(file, 'eng', { logger: m => console.log(m) });

    const { data: { words } } = result;
    let curMaxX = 0;
    let isJanJun = false;
    words.forEach(w => {
        if (w.bbox.x1 > curMaxX) curMaxX = w.bbox.x1;
        const txt = w.text.toLowerCase();
        if (txt.includes('january') || txt.includes('february') || txt.includes('march')) isJanJun = true;
    });

    const colWidth = curMaxX / 6;
    // Dynamic Mapping State for Image
    const columnMapping = {};
    const monthsShort = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    // Enhanced Header Detection Strategy for Image:
    // 1. Cluster items by Y-coordinate to find the "Header Row".
    // 2. Identify Month Names in that row.
    // 3. Construct mapping from those months.

    let rowGroups = {};
    const Y_TOLERANCE_HEADER = 20; // Looser for OCR

    // Group words by Y
    words.forEach(w => {
        const y = Math.round((w.bbox.y0 + w.bbox.y1) / 2);
        let foundY = Object.keys(rowGroups).find(key => Math.abs(key - y) < Y_TOLERANCE_HEADER);
        if (!foundY) {
            foundY = y;
            rowGroups[y] = [];
        }
        rowGroups[foundY].push({ str: w.text.trim(), x: (w.bbox.x0 + w.bbox.x1) / 2 });
    });

    // Sort rows by Y ascending (OCR Y is usually Top=0, but tesseract uses pixels so smaller Y is top)
    // Wait, typical coordinate systems: 0 is top.
    // Sort Ascending to find top rows.
    const sortedRows = Object.keys(rowGroups).sort((a, b) => a - b);

    // Find header row: Look for row containing multiple Month Names
    const monthNamesDetailed = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
    const monthNamesAbbr = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

    let detectedMonthSequence = [];
    let defaultYear = new Date().getFullYear();

    for (const y of sortedRows) {
        const items = rowGroups[y].sort((a, b) => a.x - b.x);
        let rowMonths = [];

        items.forEach(item => {
            const lower = item.str.toLowerCase().replace(/[^a-z]/g, '');
            // Check full names or abbr
            let mIndex = monthNamesDetailed.indexOf(lower);
            if (mIndex === -1 && lower.length >= 3) {
                mIndex = monthNamesAbbr.indexOf(lower.substring(0, 3));
            }

            if (mIndex !== -1) {
                let yr = null;
                const yearMatch = item.str.match(/[- ']?(\d{2,4})$/);
                if (yearMatch) {
                    yr = parseInt(yearMatch[1]);
                    if (yr < 100) yr += 2000;
                }

                rowMonths.push({
                    month: mIndex,
                    year: yr,
                    x: item.x
                });
            }
        });

        if (rowMonths.length >= 3) {
            detectedMonthSequence = rowMonths;
            break;
        }
    }

    // Map Columns to Months
    if (detectedMonthSequence.length > 0) {
        const cWidth = colWidth;

        detectedMonthSequence.forEach(h => {
            const colIdx = Math.floor((h.x - 10) / cWidth); // Adjust logic for OCR center
            if (colIdx >= 0 && colIdx <= 5) {
                columnMapping[colIdx] = { month: h.month, year: h.year || defaultYear };
            }
        });

        // Fix missing years
        let runningYear = defaultYear;
        const firstExplicit = Object.values(columnMapping).find(v => v.year !== defaultYear);
        if (firstExplicit) runningYear = firstExplicit.year;

        const sortedCols = Object.keys(columnMapping).sort();
        if (sortedCols.length > 0) {
            sortedCols.forEach((c, idx) => {
                const m = columnMapping[c].month;
                if (columnMapping[c].year === defaultYear && idx > 0) {
                    const prevM = columnMapping[sortedCols[idx - 1]].month;
                    if (m < prevM) runningYear++;
                    columnMapping[c].year = runningYear;
                } else if (columnMapping[c].year) {
                    runningYear = columnMapping[c].year;
                }
            });
        }
    } else {
        // Fallback
        if (isJanJun) {
            [0, 1, 2, 3, 4, 5].forEach(i => columnMapping[i] = { month: i, year: defaultYear });
        } else {
            [6, 7, 8, 9, 10, 11].forEach(i => columnMapping[i] = { month: i, year: defaultYear });
        }
    }

    const rows = {};
    const Y_TOLERANCE = 20; // Pixels

    words.forEach(w => {
        const yCenter = (w.bbox.y0 + w.bbox.y1) / 2;
        const binnedY = Math.round(yCenter / Y_TOLERANCE) * Y_TOLERANCE;

        const xCenter = (w.bbox.x0 + w.bbox.x1) / 2;
        const colIndex = Math.floor(xCenter / colWidth);

        if (colIndex < 0 || colIndex > 5) return;

        if (!rows[binnedY]) rows[binnedY] = {};
        if (!rows[binnedY][colIndex]) rows[binnedY][colIndex] = [];

        rows[binnedY][colIndex].push(w.text);
    });

    Object.keys(rows).forEach(y => {
        Object.keys(rows[y]).forEach(colIndex => {
            const cellText = rows[y][colIndex].join(" ").trim();

            const mapping = columnMapping[parseInt(colIndex)];
            if (!mapping) return;
            const month = mapping.month;
            const year = mapping.year;

            const dateMatch = cellText.match(/^(\d{1,2})\b/);
            if (!dateMatch) return;

            const day = parseInt(dateMatch[1]);
            if (day < 1 || day > 31) return;

            // Cleaning Logic
            let cleanedText = cellText.replace(/^(\d{1,2})\b/, '').trim();
            cleanedText = cleanedText.replace(/\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*\b/gi, '').trim();
            cleanedText = cleanedText.replace(/Day\s*-\s*\d+/gi, '').trim();
            // Remove date ranges with dashes or dots
            cleanedText = cleanedText.replace(/(\d{1,2}[-.]\d{1,2}[-.]\d{2,4})\s*(to|-)?\s*(\d{1,2}[-.]\d{1,2}[-.]\d{2,4})?/gi, '').trim();
            // Remove specific noise
            cleanedText = cleanedText.replace(/Period\s*-\s*\(?\)?/gi, '').trim();
            cleanedText = cleanedText.replace(/[()]/g, '').trim();

            const lowerText = cleanedText.toLowerCase();
            let eventType = null;

            // Strict Filtering
            if (lowerText.includes('holiday') || lowerText.includes('festival') || lowerText.includes('pongal') ||
                lowerText.includes('diwali') || lowerText.includes('deepavali') || lowerText.includes('christmas') ||
                lowerText.includes('new year') || lowerText.includes('vacation') || lowerText.includes('jayanthi') ||
                lowerText.includes('day') || // Catches Republic Day, Independence Day, May Day, etc.
                lowerText.includes('eid') || lowerText.includes('ramzan') || lowerText.includes('bakrid') ||
                lowerText.includes('muharram') || lowerText.includes('friday') || lowerText.includes('easter') ||
                lowerText.includes('onam') || lowerText.includes('dussehra') || lowerText.includes('puja') ||
                lowerText.includes('chaturthi') || lowerText.includes('krishna') || lowerText.includes('janmashtami') ||
                lowerText.includes('leave')) {
                eventType = 'holiday';
            } else if (lowerText.includes('cia') || lowerText.includes('internal') || lowerText.includes('assessment') || lowerText.includes('test')) {
                eventType = 'cia';
            } else if (lowerText.includes('exam') || lowerText.includes('semester')) {
                eventType = 'exam';
            } else if (lowerText.includes('committee') || lowerText.includes('meeting')) {
                eventType = 'meeting';
            } else if (lowerText.includes('time table') || lowerText.includes('timetable')) {
                eventType = 'timetable';
            } else if (lowerText.includes('project') || lowerText.includes('mini')) {
                eventType = 'project';
            } else if (lowerText.includes('lab')) {
                eventType = 'lab';
            }

            if (eventType && cleanedText.length > 2) {
                allEvents.push({
                    title: cleanedText,
                    day: day,
                    month: month,
                    year: year,
                    dateDisplay: `${day}`,
                    originalText: cellText,
                    type: eventType
                });
            }
        });
    });

    return allEvents;
};

export const parseTimeTableImage = async (file) => {
    const result = await Tesseract.recognize(file, 'eng', { logger: m => console.log(m) });
    const { data: { words } } = result;

    // 1. Detect Rows based on Day Names and Time Labels
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const timeLabels = ['Start Time', 'End Time'];
    const dayRows = {};
    const timeRows = {};

    // Find Y-coordinates for each day label
    days.forEach(day => {
        const match = words.find(w => w.text.toLowerCase().includes(day.toLowerCase()));
        if (match) {
            dayRows[day] = {
                yMin: match.bbox.y0 - 10,
                yMax: match.bbox.y1 + 10,
                yCenter: (match.bbox.y0 + match.bbox.y1) / 2
            };
        }
    });

    // Find Y-coordinates for time labels
    timeLabels.forEach(label => {
        const parts = label.split(' ');
        const match = words.find(w => w.text.toLowerCase() === parts[0].toLowerCase() || w.text.toLowerCase() === label.toLowerCase());
        if (match) {
            const rowY = (match.bbox.y0 + match.bbox.y1) / 2;
            timeRows[label] = { yCenter: rowY, yMin: match.bbox.y0 - 10, yMax: match.bbox.y1 + 10 };
        }
    });

    // Determine row boundaries (midpoints between day centers)
    const sortedDays = Object.keys(dayRows).sort((a, b) => dayRows[a].yCenter - dayRows[b].yCenter);
    const rowBounds = {};

    for (let i = 0; i < sortedDays.length; i++) {
        const day = sortedDays[i];
        const nextDay = sortedDays[i + 1];

        const yStart = i === 0 ? dayRows[day].yMin - 20 : (dayRows[day].yCenter + dayRows[sortedDays[i - 1]].yCenter) / 2;
        const yEnd = nextDay ? (dayRows[day].yCenter + dayRows[nextDay].yCenter) / 2 : dayRows[day].yMax + 50;

        rowBounds[day] = { yStart, yEnd };
    }

    // 2. Detect Time Headers
    let timeHeaders = [];
    let startTimes = [];
    let endTimes = [];

    // Parse Specific Time Rows if found
    if (Object.keys(timeRows).length > 0) {
        // Extract Start Times
        if (timeRows['Start Time']) {
            startTimes = words.filter(w =>
                w.bbox.y0 >= timeRows['Start Time'].yMin &&
                w.bbox.y1 <= timeRows['Start Time'].yMax &&
                !w.text.toLowerCase().includes('start') && !w.text.toLowerCase().includes('time')
            ).sort((a, b) => a.bbox.x0 - b.bbox.x0);
        }
        // Extract End Times (Assuming slightly shifted structure if needed, or row logic)
        // User's image has "End Time" row
        if (timeRows['End Time']) {
            endTimes = words.filter(w =>
                w.bbox.y0 >= timeRows['End Time'].yMin &&
                w.bbox.y1 <= timeRows['End Time'].yMax &&
                !w.text.toLowerCase().includes('end') && !w.text.toLowerCase().includes('time')
            ).sort((a, b) => a.bbox.x0 - b.bbox.x0);
        }
    }

    // Fallback to Generic Header (Row ABOVE the first day) if no specific time rows
    if (startTimes.length === 0 && sortedDays.length > 0) {
        const firstDayY = dayRows[sortedDays[0]].yMin;
        const searchHeaderY = firstDayY - 100;

        const headerWords = words.filter(w =>
            w.bbox.y1 < firstDayY &&
            w.bbox.y1 > searchHeaderY &&
            w.text.length > 1
        );

        headerWords.sort((a, b) => a.bbox.x0 - b.bbox.x0);

        let currentHeader = "";
        let lastX = -100;
        let startX = 0;

        headerWords.forEach(w => {
            if (w.bbox.x0 - lastX < 50) {
                currentHeader += " " + w.text;
            } else {
                if (currentHeader) timeHeaders.push({ text: currentHeader, x: startX });
                currentHeader = w.text;
                startX = w.bbox.x0;
            }
            lastX = w.bbox.x1;
        });
        if (currentHeader) timeHeaders.push({ text: currentHeader, x: startX });
    }

    const timetable = {};

    // 3. Group words by Day Rows
    sortedDays.forEach(day => {
        const bounds = rowBounds[day];
        const rowWords = words.filter(w =>
            w.bbox.y0 >= bounds.yStart &&
            w.bbox.y1 <= bounds.yEnd &&
            !w.text.toLowerCase().includes(day.toLowerCase()) &&
            w.text.length > 1
        );

        rowWords.sort((a, b) => a.bbox.x0 - b.bbox.x0);

        const mergedSubjects = [];
        let currentSubject = "";
        let lastX = -100;
        let subjectStartX = 0;

        rowWords.forEach(w => {
            if (w.bbox.x0 - lastX < 50) {
                currentSubject += " " + w.text;
            } else {
                if (currentSubject) mergedSubjects.push({ subject: currentSubject, x: subjectStartX });
                currentSubject = w.text;
                subjectStartX = w.bbox.x0;
            }
            lastX = w.bbox.x1;
        });
        if (currentSubject) mergedSubjects.push({ subject: currentSubject, x: subjectStartX });

        timetable[day] = mergedSubjects.map((sub, idx) => {
            let timeStr = `Period ${idx + 1}`;

            // Map Times
            if (startTimes.length > 0) {
                // Simple index mapping for now as columns align in grid
                const sTime = startTimes[idx] ? startTimes[idx].text : "";
                const eTime = endTimes[idx] ? endTimes[idx].text : "";
                if (sTime) {
                    timeStr = sTime + (eTime ? ` - ${eTime}` : "");
                }
            } else if (timeHeaders.length > 0) {
                const match = timeHeaders.reduce((closest, h) => {
                    return Math.abs(h.x - sub.x) < Math.abs(closest.x - sub.x) ? h : closest;
                }, timeHeaders[0]);

                if (Math.abs(match.x - sub.x) < 200) {
                    timeStr = match.text;
                } else if (idx < timeHeaders.length) {
                    timeStr = timeHeaders[idx].text;
                }
            }

            return {
                period: idx + 1,
                subject: sub.subject,
                time: timeStr
            };
        });
    });

    return timetable;
};

export const parseTimeTablePDF = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    // Assuming single page for timetable usually
    const page = await pdf.getPage(1);
    const textContent = await page.getTextContent();
    const items = textContent.items;

    let words = items.map(item => {
        const tx = item.transform;
        const x = tx[4];
        const y = tx[5];
        const width = item.width;
        const height = item.height;

        return {
            text: item.str,
            x0: x,
            x1: x + width,
            y0: y,       // PDF Y (Bottom)
            y1: y + height, // PDF Y (Top)
            // Invert Y for logic if needed, or just sort Descending for Rows
            yForSort: y
        };
    });

    // 1. Detect Rows based on Day Names
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const dayRows = {};

    // Find Y-coordinates for each day label
    days.forEach(day => {
        const match = words.find(w => w.text.toLowerCase().includes(day.toLowerCase()));
        if (match) {
            dayRows[day] = {
                yCenter: match.yForSort
            };
        }
    });

    const sortedDays = Object.keys(dayRows).sort((a, b) => {
        return dayRows[b].yCenter - dayRows[a].yCenter;
    });

    const rowBounds = {};
    for (let i = 0; i < sortedDays.length; i++) {
        const day = sortedDays[i];
        const nextDay = sortedDays[i + 1];

        const yTop = i === 0 ? dayRows[day].yCenter + 50 : (dayRows[day].yCenter + dayRows[sortedDays[i - 1]].yCenter) / 2;
        const yBottom = nextDay ? (dayRows[day].yCenter + dayRows[nextDay].yCenter) / 2 : dayRows[day].yCenter - 50;

        rowBounds[day] = { yMin: yBottom, yMax: yTop };
    }

    // 2. Detect Time Headers (Row ABOVE the first day)
    let timeHeaders = [];
    if (sortedDays.length > 0) {
        const firstDayY = dayRows[sortedDays[0]].yCenter;
        const searchHeaderYMin = firstDayY;
        const searchHeaderYMax = firstDayY + 100;

        const headerWords = words.filter(w =>
            w.yForSort > searchHeaderYMin &&
            w.yForSort < searchHeaderYMax &&
            w.text.length > 2
        );

        headerWords.sort((a, b) => a.x0 - b.x0);

        let currentHeader = "";
        let lastX = -100;
        let startX = 0;

        headerWords.forEach(w => {
            if (w.x0 - lastX < 20) {
                currentHeader += " " + w.text;
            } else {
                if (currentHeader) timeHeaders.push({ text: currentHeader, x: startX });
                currentHeader = w.text;
                startX = w.x0;
            }
            lastX = w.x1;
        });
        if (currentHeader) timeHeaders.push({ text: currentHeader, x: startX });
    }

    const timetable = {};

    sortedDays.forEach(day => {
        const bounds = rowBounds[day];
        const rowWords = words.filter(w =>
            w.yForSort >= bounds.yMin &&
            w.yForSort <= bounds.yMax &&
            !w.text.toLowerCase().includes(day.toLowerCase()) &&
            w.text.trim().length > 1
        );

        rowWords.sort((a, b) => a.x0 - b.x0);

        const mergedSubjects = [];
        let currentSubject = "";
        let lastX = -1000;
        let subjectStartX = 0;

        rowWords.forEach(w => {
            if (w.x0 - lastX < 20) {
                currentSubject += " " + w.text;
            } else {
                if (currentSubject) mergedSubjects.push({ subject: currentSubject, x: subjectStartX });
                currentSubject = w.text;
                subjectStartX = w.x0;
            }
            lastX = w.x1;
        });
        if (currentSubject) mergedSubjects.push({ subject: currentSubject, x: subjectStartX });

        timetable[day] = mergedSubjects.map((sub, idx) => {
            let timeStr = `Period ${idx + 1}`;

            if (timeHeaders.length > 0) {
                const match = timeHeaders.reduce((closest, h) => {
                    return Math.abs(h.x - sub.x) < Math.abs(closest.x - sub.x) ? h : closest;
                }, timeHeaders[0]);

                if (Math.abs(match.x - sub.x) < 50) {
                    timeStr = match.text;
                } else if (idx < timeHeaders.length) {
                    timeStr = timeHeaders[idx].text;
                }
            }

            return {
                period: idx + 1,
                subject: sub.subject,
                time: timeStr
            };
        });
    });

    return timetable;
};
