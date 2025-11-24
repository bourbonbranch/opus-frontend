/**
 * Auto-Seating Utility
 * Generates placement instructions for automatically seating students on risers
 * based on their voice section and selected layout pattern.
 */

/**
 * Layout configurations mapping voice sections to row priorities
 * Lower number = front rows (closer to audience)
 */
const LAYOUT_CONFIGS = {
    SATB: {
        name: 'SATB (Traditional)',
        order: ['Soprano', 'Alto', 'Tenor', 'Bass']
    },
    STBA: {
        name: 'STBA (Mixed)',
        order: ['Soprano', 'Tenor', 'Bass', 'Alto']
    },
    SSAA: {
        name: 'SSAA (Treble)',
        order: ['Soprano', 'Alto'] // Only uses these sections
    },
    TTBB: {
        name: 'TTBB (Bass)',
        order: ['Tenor', 'Bass'] // Only uses these sections
    }
};

/**
 * Calculate how many students can fit in a row based on riser width and spacing
 * @param {number} moduleWidth - Width of the riser module in feet
 * @returns {number} Maximum number of students per row
 */
function calculateRowCapacity(moduleWidth) {
    const singerSpacing = 18; // inches per singer (from RiserSection.jsx)
    const widthInches = moduleWidth * 12;
    return Math.floor(widthInches / singerSpacing);
}

/**
 * Generate auto-seating placement instructions
 * @param {Array} students - Array of student objects with {id, name, section}
 * @param {Array} placedStudents - Array of already-placed students
 * @param {Array} riserSections - Array of riser section configurations
 * @param {number} globalRows - Number of rows per section
 * @param {number} globalModuleWidth - Width of riser modules in feet
 * @param {string} layoutType - Layout type: 'SATB', 'STBA', 'SSAA', 'TTBB'
 * @returns {Array} Array of placement instructions: {studentId, sectionId, row, slotIndex}
 */
export function generateAutoSeating(
    students,
    placedStudents,
    riserSections,
    globalRows,
    globalModuleWidth,
    layoutType
) {
    const placements = [];
    const config = LAYOUT_CONFIGS[layoutType];

    if (!config) {
        console.error(`Unknown layout type: ${layoutType}`);
        return [];
    }

    // Get IDs of already-placed students to skip them
    const placedStudentIds = new Set(placedStudents.map(ps => String(ps.studentId)));

    // Calculate row capacity
    const rowCapacity = calculateRowCapacity(globalModuleWidth);

    // Group unplaced students by voice section
    const studentsBySection = {};
    config.order.forEach(section => {
        studentsBySection[section] = students.filter(
            s => s.section === section && !placedStudentIds.has(String(s.id))
        );
    });

    // Track how many students are placed in each section/row
    const sectionRowCounts = {};
    riserSections.forEach(section => {
        sectionRowCounts[section.id] = {};
        for (let row = 0; row <= globalRows; row++) {
            sectionRowCounts[section.id][row] = 0;
        }
    });

    // Count existing placements
    placedStudents.forEach(ps => {
        if (sectionRowCounts[ps.sectionId] && sectionRowCounts[ps.sectionId][ps.row] !== undefined) {
            sectionRowCounts[ps.sectionId][ps.row]++;
        }
    });

    // Distribute sections across riser sections
    const sectionsPerRiser = Math.ceil(config.order.length / riserSections.length);

    config.order.forEach((voiceSection, voiceSectionIndex) => {
        const studentsToPlace = studentsBySection[voiceSection] || [];
        if (studentsToPlace.length === 0) return;

        // Determine which riser section(s) this voice section should use
        const riserIndex = Math.floor(voiceSectionIndex / sectionsPerRiser);
        const riserSection = riserSections[riserIndex];

        if (!riserSection) return;

        // Calculate which rows this voice section should occupy
        const voiceIndexInRiser = voiceSectionIndex % sectionsPerRiser;
        const rowsPerVoice = Math.ceil(globalRows / sectionsPerRiser);
        const startRow = voiceIndexInRiser * rowsPerVoice;
        const endRow = Math.min(startRow + rowsPerVoice, globalRows);

        // Place students front-to-back (higher row numbers first for risers)
        let studentIndex = 0;
        for (let row = endRow; row >= startRow && studentIndex < studentsToPlace.length; row--) {
            const currentCount = sectionRowCounts[riserSection.id][row];
            const availableSlots = rowCapacity - currentCount;

            for (let slot = 0; slot < availableSlots && studentIndex < studentsToPlace.length; slot++) {
                const student = studentsToPlace[studentIndex];
                placements.push({
                    studentId: String(student.id),
                    sectionId: riserSection.id,
                    row: row,
                    slotIndex: currentCount + slot,
                    student: student
                });
                studentIndex++;
                sectionRowCounts[riserSection.id][row]++;
            }
        }
    });

    return placements;
}

/**
 * Get available layout types
 * @returns {Array} Array of {key, name} objects
 */
export function getAvailableLayouts() {
    return Object.entries(LAYOUT_CONFIGS).map(([key, config]) => ({
        key,
        name: config.name
    }));
}
