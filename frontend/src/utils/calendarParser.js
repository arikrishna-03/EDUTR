import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

// Configure the worker - crucial for pdfjs-dist 3/4+ in Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

const defaultCourseMap = {
    'wad': { title: 'Web Application Development', instructor: 'Mr.J.Senthil' },
    'sepm': { title: 'Software Engineering and Project Management', instructor: 'Ms.K.Aarthi' },
    'dl': { title: 'Deep Learning Techniques', instructor: 'Mr.K.Sathyaseelan' },
    'iot': { title: 'IoT Architecture and Components', instructor: 'Ms.B.Padma Priya' },
    'gen ai': { title: 'Generative AI', instructor: 'Dr. M. Markco' },
    'robo': { title: 'Robotics', instructor: 'Dr.C.Antony Vasanthakumar' },
    'evs': { title: 'Environmental Sustainability', instructor: 'Dr.K.Geetha' },
    'sdg': { title: 'Holistic Insight into the UN SDGs', instructor: 'Dr.P.Ramachandran' },
    'wad lab': { title: 'Web Application Development Laboratory', instructor: 'Mr.J.Senthil' },
    'dl lab': { title: 'Deep Learning Laboratory', instructor: 'Mr.K.Sathyaseelan' },
    'twm': { title: 'Tutor Ward Meeting', instructor: 'Ms.K.Aarthi' }
};

const extractCourseMap = (text) => {
    const courseMap = {};
    if (!text) return courseMap;
    const lines = text.split('\n');
    lines.forEach(line => {
        const match = line.match(/\(([^)]+)\)/);
        if (match) {
            const abbr = match[1].trim();
            if (abbr.length > 1) {
                const instructorMatch = line.match(/(?:Mr\.|Ms\.|Dr\.|Prof\.)\s*[A-Z][a-zA-Z.]*(?:\s+[A-Z][a-zA-Z.]*)*/i);
                const instructor = instructorMatch ? instructorMatch[0].trim() : "";
                
                const parts = line.split(`(${abbr})`);
                let title = "";
                if (parts.length > 0) {
                    let left = parts[0].trim();
                    left = left.replace(/^\d+/, '').trim();
                    left = left.replace(/^[A-Z0-9-]{5,10}/, '').trim();
                    title = left.trim();
                }
                
                if (abbr && title) {
                    courseMap[abbr.toLowerCase()] = {
                        title: title,
                        instructor: instructor || "Faculty"
                    };
                }
            }
        }
    });
    return courseMap;
};

const expandSubject = (subject, mergedCourseMap, idx) => {
    const cleanSub = subject.trim().toLowerCase();
    let displayTitle = subject;
    let instructor = `Instructor ${idx + 1}`;
    
    const keys = Object.keys(mergedCourseMap);
    keys.sort((a, b) => b.length - a.length);
    
    const matchedKey = keys.find(key => 
        cleanSub === key || 
        cleanSub === `(${key})` ||
        cleanSub.includes(`(${key})`) ||
        cleanSub.replace(/[^a-z0-9]/g, '') === key.replace(/[^a-z0-9]/g, '')
    );
    
    if (matchedKey) {
        displayTitle = mergedCourseMap[matchedKey].title;
        instructor = mergedCourseMap[matchedKey].instructor;
    } else {
        const substringKey = keys.find(key => cleanSub.includes(key) || key.includes(cleanSub));
        if (substringKey) {
            displayTitle = mergedCourseMap[substringKey].title;
            instructor = mergedCourseMap[substringKey].instructor;
        }
    }
    
    return { title: displayTitle, instructor };
};


/**
 * Parses the uploaded Academic Calendar PDF.
 * Assumes a grid with Date, Day, Event/Description.
 */
export const parseCalendarPDF = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    let allEvents = [];
    const columnMapping = {};
    const monthsShort = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    let defaultYear = new Date().getFullYear();
    let isJanJun = false;

    // First pass: Calculate content bounds to determine grid width accurately
    let minX = Infinity;
    let maxX = -Infinity;

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        textContent.items.forEach(item => {
            const str = item.str.trim();
            if (str.length > 0) {
                const lowerStr = str.toLowerCase();
                if (lowerStr.includes('january') || lowerStr.includes('february') || lowerStr.includes('march')) {
                    isJanJun = true;
                }

                const x = item.transform[4];
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
            }
        });
    }

    if (minX === Infinity) { minX = 0; maxX = 600; }

    const gridWidth = maxX - minX;
    const colWidth = gridWidth / 6;
    const colCenters = Array.from({ length: 6 }, (_, i) => minX + (i + 0.5) * colWidth);

    // Enhanced Header Detection Strategy:
    let rowGroups = {};
    const Y_TOLERANCE_HEADER = 10;

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        textContent.items.forEach(item => {
            const y = Math.round(item.transform[5]);
            let foundY = Object.keys(rowGroups).find(key => Math.abs(key - y) < Y_TOLERANCE_HEADER);
            if (!foundY) {
                foundY = y;
                rowGroups[y] = [];
            }
            rowGroups[foundY].push({ str: item.str.trim(), x: item.transform[4] });
        });
    }

    const sortedRows = Object.keys(rowGroups).sort((a, b) => b - a);

    const monthNamesDetailed = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
    const monthNamesAbbr = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

    let detectedMonthSequence = [];

    for (const y of sortedRows) {
        const items = rowGroups[y].sort((a, b) => a.x - b.x);
        let rowMonths = [];

        items.forEach(item => {
            const lower = item.str.toLowerCase().replace(/[^a-z]/g, '');
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

    let currentYVal = defaultYear;

    if (detectedMonthSequence.length > 0) {
        detectedMonthSequence.forEach(h => {
            let bestColIdx = 0;
            let minDistance = Infinity;
            colCenters.forEach((center, idx) => {
                const dist = Math.abs(h.x - center);
                if (dist < minDistance) {
                    minDistance = dist;
                    bestColIdx = idx;
                }
            });

            let yr = h.year;
            if (!yr) {
                yr = currentYVal;
            }
            columnMapping[bestColIdx] = { month: h.month, year: yr || defaultYear };
        });

        // Fix missing years by iterating
        let runningYear = defaultYear;
        const firstExplicit = Object.values(columnMapping).find(v => v.year !== defaultYear);
        if (firstExplicit) runningYear = firstExplicit.year;

        const sortedCols = Object.keys(columnMapping).sort();
        if (sortedCols.length > 0) {
            sortedCols.forEach((c, idx) => {
                const m = columnMapping[c].month;
                if (columnMapping[c].year === defaultYear && idx > 0) {
                    const prevM = columnMapping[sortedCols[idx - 1]].month;
                    if (m < prevM) {
                        runningYear++;
                    }
                    columnMapping[c].year = runningYear;
                } else if (columnMapping[c].year) {
                    runningYear = columnMapping[c].year;
                }
            });
        }
    } else {
        if (isJanJun) {
            [0, 1, 2, 3, 4, 5].forEach(i => columnMapping[i] = { month: i, year: defaultYear });
        } else {
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

            // Find closest column center
            let bestColIdx = 0;
            let minDistance = Infinity;
            colCenters.forEach((center, idx) => {
                const dist = Math.abs(x - center);
                if (dist < minDistance) {
                    minDistance = dist;
                    bestColIdx = idx;
                }
            });

            if (x < minX - 20 || x > maxX + 20) return;

            if (!rows[y]) rows[y] = {};
            if (!rows[y][bestColIdx]) rows[y][bestColIdx] = [];

            rows[y][bestColIdx].push(item.str);
        });

        // Process grid cells
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

                let cleanedText = cellText.replace(/^(\d{1,2})\b/, '').trim();
                cleanedText = cleanedText.replace(/\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*\b/gi, '').trim();
                cleanedText = cleanedText.replace(/Day\s*-\s*\d+/gi, '').trim();
                cleanedText = cleanedText.replace(/(\d{1,2}[-.]\d{1,2}[-.]\d{2,4})\s*(to|-)?\s*(\d{1,2}[-.]\d{1,2}[-.]\d{2,4})?/gi, '').trim();
                cleanedText = cleanedText.replace(/Period\s*-\s*\(?\)?/gi, '').trim();
                cleanedText = cleanedText.replace(/[()]/g, '').trim();

                const lowerText = cleanedText.toLowerCase();
                let eventType = null;

                if (lowerText.includes('holiday') || lowerText.includes('festival') || lowerText.includes('pongal') ||
                    lowerText.includes('diwali') || lowerText.includes('deepavali') || lowerText.includes('christmas') ||
                    lowerText.includes('new year') || lowerText.includes('vacation') || lowerText.includes('jayanthi') ||
                    lowerText.includes('day') ||
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
    }

    return allEvents;
};

export const parseCalendarImage = async (file) => {
    let worker = null;
    try {
        worker = await Tesseract.createWorker('eng', 1);
        const result = await worker.recognize(file, {}, { blocks: true });
        const { data } = result;

        let words = [];
        if (data.blocks) {
            data.blocks.forEach(block => {
                if (block.paragraphs) {
                    block.paragraphs.forEach(para => {
                        if (para.lines) {
                            para.lines.forEach(line => {
                                if (line.words) {
                                    words.push(...line.words);
                                }
                            });
                        }
                    });
                }
            });
        }

        let isJanJun = false;
        let curMaxX = 0;
        words.forEach(w => {
            if (!w.text) return;
            if (w.bbox.x1 > curMaxX) curMaxX = w.bbox.x1;
            const txt = w.text.toLowerCase();
            if (txt.includes('january') || txt.includes('february') || txt.includes('march')) {
                isJanJun = true;
            }
        });

        // Determine grid bounds based on numbers or month headers to exclude margins
        const monthNamesDetailed = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
        const monthNamesAbbr = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

        let minX = Infinity;
        let maxX = -Infinity;

        words.forEach(w => {
            if (!w.text) return;
            const txt = w.text.toLowerCase();
            const isDate = /^\d{1,2}\b/.test(w.text);
            const cleanTxt = txt.replace(/[^a-z]/g, '');
            const isMonth = monthNamesDetailed.includes(cleanTxt) || monthNamesAbbr.includes(cleanTxt.substring(0, 3));

            if (isDate || isMonth) {
                if (w.bbox.x0 < minX) minX = w.bbox.x0;
                if (w.bbox.x1 > maxX) maxX = w.bbox.x1;
            }
        });

        if (minX === Infinity) { minX = 0; maxX = curMaxX || 800; }

        const gridWidth = maxX - minX;
        const colWidth = gridWidth / 6;
        const colCenters = Array.from({ length: 6 }, (_, i) => minX + (i + 0.5) * colWidth);

        // Dynamic Mapping State for Image
        const columnMapping = {};
        let defaultYear = new Date().getFullYear();

        // 1. Cluster items by Y-coordinate to find the "Header Row"
        let rowGroups = {};
        const Y_TOLERANCE_HEADER = 20;

        words.forEach(w => {
            if (!w.text) return;
            const y = Math.round((w.bbox.y0 + w.bbox.y1) / 2);
            let foundY = Object.keys(rowGroups).find(key => Math.abs(key - y) < Y_TOLERANCE_HEADER);
            if (!foundY) {
                foundY = y;
                rowGroups[y] = [];
            }
            rowGroups[foundY].push({ str: w.text.trim(), x: (w.bbox.x0 + w.bbox.x1) / 2 });
        });

        const sortedRows = Object.keys(rowGroups).sort((a, b) => a - b);
        let detectedMonthSequence = [];

        for (const y of sortedRows) {
            const items = rowGroups[y].sort((a, b) => a.x - b.x);
            let rowMonths = [];

            items.forEach(item => {
                const lower = item.str.toLowerCase().replace(/[^a-z]/g, '');
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
            detectedMonthSequence.forEach(h => {
                let bestColIdx = 0;
                let minDistance = Infinity;
                colCenters.forEach((center, idx) => {
                    const dist = Math.abs(h.x - center);
                    if (dist < minDistance) {
                        minDistance = dist;
                        bestColIdx = idx;
                    }
                });
                columnMapping[bestColIdx] = { month: h.month, year: h.year || defaultYear };
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
            if (isJanJun) {
                [0, 1, 2, 3, 4, 5].forEach(i => columnMapping[i] = { month: i, year: defaultYear });
            } else {
                [6, 7, 8, 9, 10, 11].forEach(i => columnMapping[i] = { month: i, year: defaultYear });
            }
        }

        const rows = {};
        const Y_TOLERANCE = 20;

        words.forEach(w => {
            if (!w.text) return;
            const yCenter = (w.bbox.y0 + w.bbox.y1) / 2;
            const binnedY = Math.round(yCenter / Y_TOLERANCE) * Y_TOLERANCE;

            const xCenter = (w.bbox.x0 + w.bbox.x1) / 2;

            let bestColIdx = 0;
            let minDistance = Infinity;
            colCenters.forEach((center, idx) => {
                const dist = Math.abs(xCenter - center);
                if (dist < minDistance) {
                    minDistance = dist;
                    bestColIdx = idx;
                }
            });

            if (xCenter < minX - 30 || xCenter > maxX + 30) return;

            if (!rows[binnedY]) rows[binnedY] = {};
            if (!rows[binnedY][bestColIdx]) rows[binnedY][bestColIdx] = [];

            rows[binnedY][bestColIdx].push(w.text);
        });

        const allEvents = [];

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

                let cleanedText = cellText.replace(/^(\d{1,2})\b/, '').trim();
                cleanedText = cleanedText.replace(/\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*\b/gi, '').trim();
                cleanedText = cleanedText.replace(/Day\s*-\s*\d+/gi, '').trim();
                cleanedText = cleanedText.replace(/(\d{1,2}[-.]\d{1,2}[-.]\d{2,4})\s*(to|-)?\s*(\d{1,2}[-.]\d{1,2}[-.]\d{2,4})?/gi, '').trim();
                cleanedText = cleanedText.replace(/Period\s*-\s*\(?\)?/gi, '').trim();
                cleanedText = cleanedText.replace(/[()]/g, '').trim();

                const lowerText = cleanedText.toLowerCase();
                let eventType = null;

                if (lowerText.includes('holiday') || lowerText.includes('festival') || lowerText.includes('pongal') ||
                    lowerText.includes('diwali') || lowerText.includes('deepavali') || lowerText.includes('christmas') ||
                    lowerText.includes('new year') || lowerText.includes('vacation') || lowerText.includes('jayanthi') ||
                    lowerText.includes('day') ||
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

        if (worker) {
            await worker.terminate();
        }
        return allEvents;
    } catch (err) {
        if (worker) {
            await worker.terminate();
        }
        console.error("Error in parseCalendarImage:", err);
        throw err;
    }
};

export const parseTimeTableImage = async (file) => {
    let worker = null;
    try {
        worker = await Tesseract.createWorker('eng', 1);
        const result = await worker.recognize(file, {}, { blocks: true });
        const { data } = result;
        const text = data.text || "";

        let words = [];
        if (data.blocks) {
            data.blocks.forEach(block => {
                if (block.paragraphs) {
                    block.paragraphs.forEach(para => {
                        if (para.lines) {
                            para.lines.forEach(line => {
                                if (line.words) {
                                    words.push(...line.words);
                                }
                            });
                        }
                    });
                }
            });
        }

        // Detect course map from full text
        const courseMap = extractCourseMap(text);
        const mergedCourseMap = { ...defaultCourseMap, ...courseMap };

        // Helper to match day names strictly as standalone words
        const isDayWord = (text, dayName, abbrs) => {
            if (!text) return false;
            const clean = text.toLowerCase().replace(/[^a-z]/g, '');
            if (clean === dayName.toLowerCase()) return true;
            if (abbrs.some(abbr => clean === abbr)) return true;
            
            const parts = text.toLowerCase().split(/[^a-z]+/).filter(Boolean);
            if (parts.includes(dayName.toLowerCase())) return true;
            if (abbrs.some(abbr => parts.includes(abbr))) return true;
            
            return false;
        };

        // 1. Detect Rows based on Day Names
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        const dayRows = {};

        days.forEach(day => {
            let abbrs = [];
            if (day === 'Monday') abbrs = ['mon'];
            else if (day === 'Tuesday') abbrs = ['tue', 'tues'];
            else if (day === 'Wednesday') abbrs = ['wed', 'weds'];
            else if (day === 'Thursday') abbrs = ['thu', 'thur', 'thurs'];
            else if (day === 'Friday') abbrs = ['fri'];

            const match = words.find(w => isDayWord(w.text, day, abbrs));
            if (match) {
                dayRows[day] = {
                    yMin: match.bbox.y0 - 15,
                    yMax: match.bbox.y1 + 15,
                    yCenter: (match.bbox.y0 + match.bbox.y1) / 2
                };
            }
        });

        const sortedDays = Object.keys(dayRows).sort((a, b) => dayRows[a].yCenter - dayRows[b].yCenter);
        const rowBounds = {};

        for (let i = 0; i < sortedDays.length; i++) {
            const day = sortedDays[i];
            const nextDay = sortedDays[i + 1];

            const yStart = i === 0 ? dayRows[day].yMin - 30 : (dayRows[day].yCenter + dayRows[sortedDays[i - 1]].yCenter) / 2;
            const yEnd = nextDay ? (dayRows[day].yCenter + dayRows[nextDay].yCenter) / 2 : dayRows[day].yMax + 60;

            rowBounds[day] = { yStart, yEnd };
        }

        // 2. Detect Start Time and End Time rows using fuzzy matching on "start" and "end"
        let startTimes = [];
        let endTimes = [];

        const startWord = words.find(w => w.text && (w.text.toLowerCase().includes('start') || w.text.toLowerCase().includes('timing')));
        if (startWord) {
            const startYCenter = (startWord.bbox.y0 + startWord.bbox.y1) / 2;
            const startRowWords = words.filter(w => 
                w.text &&
                Math.abs((w.bbox.y0 + w.bbox.y1)/2 - startYCenter) < 20 &&
                !w.text.toLowerCase().includes('start') && 
                !w.text.toLowerCase().includes('time') &&
                !w.text.toLowerCase().includes('timing')
            ).sort((a, b) => a.bbox.x0 - b.bbox.x0);

            let currentStr = "";
            let lastX = -100;
            let startX = 0;
            startRowWords.forEach(w => {
                if (w.bbox.x0 - lastX < 45) {
                    currentStr += " " + w.text;
                } else {
                    if (currentStr) startTimes.push({ text: currentStr.trim(), x0: startX, x1: lastX });
                    currentStr = w.text;
                    startX = w.bbox.x0;
                }
                lastX = w.bbox.x1;
            });
            if (currentStr) startTimes.push({ text: currentStr.trim(), x0: startX, x1: lastX });
        }

        const endWord = words.find(w => w.text && w.text.toLowerCase().includes('end'));
        if (endWord) {
            const endYCenter = (endWord.bbox.y0 + endWord.bbox.y1) / 2;
            const endRowWords = words.filter(w => 
                w.text &&
                Math.abs((w.bbox.y0 + w.bbox.y1)/2 - endYCenter) < 20 &&
                !w.text.toLowerCase().includes('end') && 
                !w.text.toLowerCase().includes('time')
            ).sort((a, b) => a.bbox.x0 - b.bbox.x0);

            let currentStr = "";
            let lastX = -100;
            let startX = 0;
            endRowWords.forEach(w => {
                if (w.bbox.x0 - lastX < 45) {
                    currentStr += " " + w.text;
                } else {
                    if (currentStr) endTimes.push({ text: currentStr.trim(), x0: startX, x1: lastX });
                    currentStr = w.text;
                    startX = w.bbox.x0;
                }
                lastX = w.bbox.x1;
            });
            if (currentStr) endTimes.push({ text: currentStr.trim(), x0: startX, x1: lastX });
        }

        if (startTimes.length === 0 && sortedDays.length > 0) {
            const firstDayY = dayRows[sortedDays[0]].yMin;
            const timeHeaderWords = words.filter(w => 
                w.text &&
                w.bbox.y1 < firstDayY &&
                (w.text.includes(':') || w.text.toLowerCase().includes('am') || w.text.toLowerCase().includes('pm'))
            ).sort((a, b) => a.bbox.x0 - b.bbox.x0);

            let currentStr = "";
            let lastX = -100;
            let startX = 0;
            timeHeaderWords.forEach(w => {
                if (w.bbox.x0 - lastX < 60) {
                    currentStr += " " + w.text;
                } else {
                    if (currentStr) startTimes.push({ text: currentStr.trim(), x0: startX, x1: lastX });
                    currentStr = w.text;
                    startX = w.bbox.x0;
                }
                lastX = w.bbox.x1;
            });
            if (currentStr) startTimes.push({ text: currentStr.trim(), x0: startX, x1: lastX });
            
            endTimes = startTimes.map(st => ({ text: "", x0: st.x0, x1: st.x1 }));
        }

        const COLUMN_METADATA = [
            { isBreak: false, period: 1, defaultStart: "8:40 AM", defaultEnd: "9:30 AM" },
            { isBreak: false, period: 2, defaultStart: "9:30 AM", defaultEnd: "10:20 AM" },
            { isBreak: true, period: null, subject: "BREAK", defaultStart: "10:20 AM", defaultEnd: "10:35 AM" },
            { isBreak: false, period: 3, defaultStart: "10:35 AM", defaultEnd: "11:25 AM" },
            { isBreak: false, period: 4, defaultStart: "11:25 AM", defaultEnd: "12:15 PM" },
            { isBreak: true, period: null, subject: "LUNCH BREAK", defaultStart: "12:15 PM", defaultEnd: "12:55 PM" },
            { isBreak: false, period: 5, defaultStart: "12:55 PM", defaultEnd: "1:45 PM" },
            { isBreak: false, period: 6, defaultStart: "1:45 PM", defaultEnd: "2:35 PM" },
            { isBreak: true, period: null, subject: "BREAK", defaultStart: "2:35 PM", defaultEnd: "2:50 PM" },
            { isBreak: false, period: 7, defaultStart: "2:50 PM", defaultEnd: "3:40 PM" },
            { isBreak: false, period: 8, defaultStart: "3:40 PM", defaultEnd: "4:25 PM" }
        ];

        if (startTimes.length === 0) {
            startTimes = COLUMN_METADATA.map((m, idx) => ({ text: m.defaultStart, x0: 100 + idx * 60, x1: 150 + idx * 60 }));
            endTimes = COLUMN_METADATA.map((m, idx) => ({ text: m.defaultEnd, x0: 100 + idx * 60, x1: 150 + idx * 60 }));
        }

        const timetable = {};
        const useMetadata = startTimes.length === 11;

        sortedDays.forEach(day => {
            const bounds = rowBounds[day];
            const rowWords = words.filter(w => {
                if (!w.text) return false;
                const yCenter = (w.bbox.y0 + w.bbox.y1) / 2;
                return yCenter >= bounds.yStart &&
                       yCenter <= bounds.yEnd &&
                       !isDayWord(w.text, day, []) &&
                       w.text.trim().length > 0;
            });

            rowWords.sort((a, b) => a.bbox.x0 - b.bbox.x0);

            const mergedSubjects = [];
            let currentSubject = "";
            let lastX = -100;
            let subjectStartX = 0;
            let subjectEndX = 0;

            rowWords.forEach(w => {
                if (w.bbox.x0 - lastX < 45) {
                    currentSubject += " " + w.text;
                    subjectEndX = w.bbox.x1;
                } else {
                    if (currentSubject) mergedSubjects.push({ subject: currentSubject.trim(), x0: subjectStartX, x1: subjectEndX });
                    currentSubject = w.text;
                    subjectStartX = w.bbox.x0;
                    subjectEndX = w.bbox.x1;
                }
                lastX = w.bbox.x1;
            });
            if (currentSubject) mergedSubjects.push({ subject: currentSubject.trim(), x0: subjectStartX, x1: subjectEndX });

            const daySlots = [];
            mergedSubjects.forEach(sub => {
                let bestTimeIdx = -1;
                let minDistance = Infinity;

                for (let idx = 0; idx < startTimes.length; idx++) {
                    const sTime = startTimes[idx];
                    const sCenter = (sTime.x0 + sTime.x1) / 2;
                    const subCenter = (sub.x0 + sub.x1) / 2;
                    const distance = Math.abs(sCenter - subCenter);

                    if (distance < minDistance) {
                        minDistance = distance;
                        bestTimeIdx = idx;
                    }
                }

                if (bestTimeIdx !== -1) {
                    const startTimeText = startTimes[bestTimeIdx].text;
                    const endTimeText = endTimes[bestTimeIdx] ? endTimes[bestTimeIdx].text : "";
                    const timeStr = (startTimeText + (endTimeText ? ` - ${endTimeText}` : "")).replace(/\./g, ':');

                    let isBreak = sub.subject && (sub.subject.toLowerCase().includes('break') || sub.subject.toLowerCase().includes('lunch') || sub.subject.toLowerCase().includes('interval'));
                    let period = bestTimeIdx + 1;
                    let finalSubject = sub.subject;

                    if (useMetadata) {
                        const meta = COLUMN_METADATA[bestTimeIdx];
                        isBreak = meta.isBreak || isBreak;
                        period = meta.period;
                        if (meta.isBreak) {
                            finalSubject = meta.subject;
                        }
                    }

                    daySlots.push({
                        colIdx: bestTimeIdx,
                        period: period,
                        subject: finalSubject,
                        time: timeStr,
                        isBreak: isBreak
                    });
                }
            });

            // Auto-insert missing breaks
            if (useMetadata) {
                COLUMN_METADATA.forEach((meta, idx) => {
                    if (meta.isBreak) {
                        const hasBreak = daySlots.some(slot => slot.colIdx === idx);
                        if (!hasBreak) {
                            const startTimeText = startTimes[idx] ? startTimes[idx].text : meta.defaultStart;
                            const endTimeText = endTimes[idx] ? endTimes[idx].text : meta.defaultEnd;
                            const timeStr = `${startTimeText} - ${endTimeText}`.replace(/\./g, ':');
                            daySlots.push({
                                colIdx: idx,
                                period: null,
                                subject: meta.subject,
                                time: timeStr,
                                isBreak: true
                            });
                        }
                    }
                });
            }

            daySlots.sort((a, b) => a.colIdx - b.colIdx);

            const finalSlots = [];
            daySlots.forEach(slot => {
                const cleanSub = slot.subject.trim();
                if ((cleanSub === '<-' || cleanSub === '←' || cleanSub === '<' || cleanSub === '—' || cleanSub === '-') && finalSlots.length > 0) {
                    const prevSlot = finalSlots[finalSlots.length - 1];
                    const prevParts = prevSlot.time.split('-');
                    const thisParts = slot.time.split('-');
                    if (prevParts.length > 0 && thisParts.length > 1) {
                        prevSlot.time = `${prevParts[0].trim()} - ${thisParts[1].trim()}`;
                    }
                } else {
                    finalSlots.push(slot);
                }
            });

            timetable[day] = finalSlots.map((slot, idx) => {
                if (slot.isBreak) {
                    return {
                        period: slot.period,
                        subject: slot.subject.toUpperCase(),
                        time: slot.time,
                        instructor: "None",
                        isBreak: true
                    };
                }

                const expanded = expandSubject(slot.subject, mergedCourseMap, idx);
                return {
                    period: slot.period,
                    subject: expanded.title,
                    time: slot.time,
                    instructor: expanded.instructor,
                    isBreak: false
                };
            });
        });

        if (worker) {
            await worker.terminate();
        }
        return timetable;
    } catch (err) {
        if (worker) {
            await worker.terminate();
        }
        console.error("Error in parseTimeTableImage:", err);
        throw err;
    }
};

export const parseTimeTablePDF = async (file) => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        const page = await pdf.getPage(1);
        const textContent = await page.getTextContent();
        const items = textContent.items;

        let words = items
            .filter(item => item && typeof item.str === 'string')
            .map(item => {
                const tx = item.transform || [1, 0, 0, 1, 0, 0];
                const x = tx[4];
                const y = tx[5];
                const width = item.width || 0;
                const height = item.height || 0;

                return {
                    text: item.str,
                    x0: x,
                    x1: x + width,
                    y0: y,
                    y1: y + height,
                    yForSort: y
                };
            });

        const fullText = items.map(item => item ? item.str : "").join('\n');
        const courseMap = extractCourseMap(fullText);
        const mergedCourseMap = { ...defaultCourseMap, ...courseMap };

        const isDayWord = (text, dayName, abbrs) => {
            if (!text) return false;
            const clean = text.toLowerCase().replace(/[^a-z]/g, '');
            if (clean === dayName.toLowerCase()) return true;
            if (abbrs.some(abbr => clean === abbr)) return true;
            
            const parts = text.toLowerCase().split(/[^a-z]+/).filter(Boolean);
            if (parts.includes(dayName.toLowerCase())) return true;
            if (abbrs.some(abbr => parts.includes(abbr))) return true;
            
            return false;
        };

        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        const dayRows = {};

        days.forEach(day => {
            let abbrs = [];
            if (day === 'Monday') abbrs = ['mon'];
            else if (day === 'Tuesday') abbrs = ['tue', 'tues'];
            else if (day === 'Wednesday') abbrs = ['wed', 'weds'];
            else if (day === 'Thursday') abbrs = ['thu', 'thur', 'thurs'];
            else if (day === 'Friday') abbrs = ['fri'];

            const match = words.find(w => isDayWord(w.text, day, abbrs));
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

        let startTimes = [];
        let endTimes = [];

        const startWord = words.find(w => w.text && (w.text.toLowerCase().includes('start') || w.text.toLowerCase().includes('timing')));
        if (startWord) {
            const startY = startWord.yForSort;
            const startRowWords = words.filter(w => 
                w.text &&
                Math.abs(w.yForSort - startY) < 10 &&
                !w.text.toLowerCase().includes('start') && 
                !w.text.toLowerCase().includes('time') &&
                !w.text.toLowerCase().includes('timing')
            ).sort((a, b) => a.x0 - b.x0);

            let currentStr = "";
            let lastX = -100;
            let startX = 0;
            startRowWords.forEach(w => {
                if (w.x0 - lastX < 40) {
                    currentStr += " " + w.text;
                } else {
                    if (currentStr) startTimes.push({ text: currentStr.trim(), x0: startX, x1: lastX });
                    currentStr = w.text;
                    startX = w.x0;
                }
                lastX = w.x1;
            });
            if (currentStr) startTimes.push({ text: currentStr.trim(), x0: startX, x1: lastX });
        }

        const endWord = words.find(w => w.text && w.text.toLowerCase().includes('end'));
        if (endWord) {
            const endY = endWord.yForSort;
            const endRowWords = words.filter(w => 
                w.text &&
                Math.abs(w.yForSort - endY) < 10 &&
                !w.text.toLowerCase().includes('end') && 
                !w.text.toLowerCase().includes('time')
            ).sort((a, b) => a.x0 - b.x0);

            let currentStr = "";
            let lastX = -100;
            let startX = 0;
            endRowWords.forEach(w => {
                if (w.x0 - lastX < 40) {
                    currentStr += " " + w.text;
                } else {
                    if (currentStr) endTimes.push({ text: currentStr.trim(), x0: startX, x1: lastX });
                    currentStr = w.text;
                    startX = w.x0;
                }
                lastX = w.x1;
            });
            if (currentStr) endTimes.push({ text: currentStr.trim(), x0: startX, x1: lastX });
        }

        if (startTimes.length === 0 && sortedDays.length > 0) {
            const firstDayY = dayRows[sortedDays[0]].yCenter;
            const timeHeaderWords = words.filter(w =>
                w.text &&
                w.yForSort > firstDayY &&
                w.yForSort < firstDayY + 100 &&
                (w.text.includes(':') || w.text.toLowerCase().includes('am') || w.text.toLowerCase().includes('pm'))
            ).sort((a, b) => a.x0 - b.x0);

            let currentStr = "";
            let lastX = -100;
            let startX = 0;
            timeHeaderWords.forEach(w => {
                if (w.x0 - lastX < 40) {
                    currentStr += " " + w.text;
                } else {
                    if (currentStr) startTimes.push({ text: currentStr.trim(), x0: startX, x1: lastX });
                    currentStr = w.text;
                    startX = w.x0;
                }
                lastX = w.x1;
            });
            if (currentStr) startTimes.push({ text: currentStr.trim(), x0: startX, x1: lastX });

            endTimes = startTimes.map(st => ({ text: "", x0: st.x0, x1: st.x1 }));
        }

        const COLUMN_METADATA = [
            { isBreak: false, period: 1, defaultStart: "8:40 AM", defaultEnd: "9:30 AM" },
            { isBreak: false, period: 2, defaultStart: "9:30 AM", defaultEnd: "10:20 AM" },
            { isBreak: true, period: null, subject: "BREAK", defaultStart: "10:20 AM", defaultEnd: "10:35 AM" },
            { isBreak: false, period: 3, defaultStart: "10:35 AM", defaultEnd: "11:25 AM" },
            { isBreak: false, period: 4, defaultStart: "11:25 AM", defaultEnd: "12:15 PM" },
            { isBreak: true, period: null, subject: "LUNCH BREAK", defaultStart: "12:15 PM", defaultEnd: "12:55 PM" },
            { isBreak: false, period: 5, defaultStart: "12:55 PM", defaultEnd: "1:45 PM" },
            { isBreak: false, period: 6, defaultStart: "1:45 PM", defaultEnd: "2:35 PM" },
            { isBreak: true, period: null, subject: "BREAK", defaultStart: "2:35 PM", defaultEnd: "2:50 PM" },
            { isBreak: false, period: 7, defaultStart: "2:50 PM", defaultEnd: "3:40 PM" },
            { isBreak: false, period: 8, defaultStart: "3:40 PM", defaultEnd: "4:25 PM" }
        ];

        if (startTimes.length === 0) {
            startTimes = COLUMN_METADATA.map((m, idx) => ({ text: m.defaultStart, x0: 100 + idx * 60, x1: 150 + idx * 60 }));
            endTimes = COLUMN_METADATA.map((m, idx) => ({ text: m.defaultEnd, x0: 100 + idx * 60, x1: 150 + idx * 60 }));
        }

        const timetable = {};
        const useMetadata = startTimes.length === 11;

        sortedDays.forEach(day => {
            const bounds = rowBounds[day];
            const rowWords = words.filter(w =>
                w.text &&
                w.yForSort >= bounds.yMin &&
                w.yForSort <= bounds.yMax &&
                !isDayWord(w.text, day, []) &&
                w.text.trim().length > 0
            );

            rowWords.sort((a, b) => a.x0 - b.x0);

            const mergedSubjects = [];
            let currentSubject = "";
            let lastX = -1000;
            let subjectStartX = 0;
            let subjectEndX = 0;

            rowWords.forEach(w => {
                if (w.x0 - lastX < 30) {
                    currentSubject += " " + w.text;
                    subjectEndX = w.x1;
                } else {
                    if (currentSubject) mergedSubjects.push({ subject: currentSubject.trim(), x0: subjectStartX, x1: subjectEndX });
                    currentSubject = w.text;
                    subjectStartX = w.x0;
                    subjectEndX = w.x1;
                }
                lastX = w.x1;
            });
            if (currentSubject) mergedSubjects.push({ subject: currentSubject.trim(), x0: subjectStartX, x1: subjectEndX });

            const daySlots = [];
            mergedSubjects.forEach(sub => {
                let bestTimeIdx = -1;
                let minDistance = Infinity;

                for (let idx = 0; idx < startTimes.length; idx++) {
                    const sTime = startTimes[idx];
                    const sCenter = (sTime.x0 + sTime.x1) / 2;
                    const subCenter = (sub.x0 + sub.x1) / 2;
                    const distance = Math.abs(sCenter - subCenter);

                    if (distance < minDistance) {
                        minDistance = distance;
                        bestTimeIdx = idx;
                    }
                }

                if (bestTimeIdx !== -1) {
                    const startTimeText = startTimes[bestTimeIdx].text;
                    const endTimeText = endTimes[bestTimeIdx] ? endTimes[bestTimeIdx].text : "";
                    const timeStr = (startTimeText + (endTimeText ? ` - ${endTimeText}` : "")).replace(/\./g, ':');

                    let isBreak = sub.subject && (sub.subject.toLowerCase().includes('break') || sub.subject.toLowerCase().includes('lunch') || sub.subject.toLowerCase().includes('interval'));
                    let period = bestTimeIdx + 1;
                    let finalSubject = sub.subject;

                    if (useMetadata) {
                        const meta = COLUMN_METADATA[bestTimeIdx];
                        isBreak = meta.isBreak || isBreak;
                        period = meta.period;
                        if (meta.isBreak) {
                            finalSubject = meta.subject;
                        }
                    }

                    daySlots.push({
                        colIdx: bestTimeIdx,
                        period: period,
                        subject: finalSubject,
                        time: timeStr,
                        isBreak: isBreak
                    });
                }
            });

            // Auto-insert missing breaks
            if (useMetadata) {
                COLUMN_METADATA.forEach((meta, idx) => {
                    if (meta.isBreak) {
                        const hasBreak = daySlots.some(slot => slot.colIdx === idx);
                        if (!hasBreak) {
                            const startTimeText = startTimes[idx] ? startTimes[idx].text : meta.defaultStart;
                            const endTimeText = endTimes[idx] ? endTimes[idx].text : meta.defaultEnd;
                            const timeStr = `${startTimeText} - ${endTimeText}`.replace(/\./g, ':');
                            daySlots.push({
                                colIdx: idx,
                                period: null,
                                subject: meta.subject,
                                time: timeStr,
                                isBreak: true
                            });
                        }
                    }
                });
            }

            daySlots.sort((a, b) => a.colIdx - b.colIdx);

            const finalSlots = [];
            daySlots.forEach(slot => {
                const cleanSub = slot.subject.trim();
                if ((cleanSub === '<-' || cleanSub === '←' || cleanSub === '<' || cleanSub === '—' || cleanSub === '-') && finalSlots.length > 0) {
                    const prevSlot = finalSlots[finalSlots.length - 1];
                    const prevParts = prevSlot.time.split('-');
                    const thisParts = slot.time.split('-');
                    if (prevParts.length > 0 && thisParts.length > 1) {
                        prevSlot.time = `${prevParts[0].trim()} - ${thisParts[1].trim()}`;
                    }
                } else {
                    finalSlots.push(slot);
                }
            });

            timetable[day] = finalSlots.map((slot, idx) => {
                if (slot.isBreak) {
                    return {
                        period: slot.period,
                        subject: slot.subject.toUpperCase(),
                        time: slot.time,
                        instructor: "None",
                        isBreak: true
                    };
                }

                const expanded = expandSubject(slot.subject, mergedCourseMap, idx);
                return {
                    period: slot.period,
                    subject: expanded.title,
                    time: slot.time,
                    instructor: expanded.instructor,
                    isBreak: false
                };
            });
        });

        return timetable;
    } catch (err) {
        console.error("Error in parseTimeTablePDF:", err);
        throw err;
    }
};
