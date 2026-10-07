const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const projectDir = path.join(__dirname, '..');
const languages = ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'bn', 'mr', 'ur', 'pa', 'gu'];
const requiredFiles = ['edu-store.html', 'edu-store.css', 'edu-store.js'];

console.log('==================================================');
console.log('TEST SUITE: ElectroMart Student & Educator Campus Store (Phase 40)');
console.log('==================================================');

// 1. Required files
requiredFiles.forEach((fileName) => {
  const filePath = path.join(projectDir, fileName);
  assert(fs.existsSync(filePath), `${fileName} must exist in project directory`);
});
console.log('✓ File existence verified.');

// 2. Read source contracts
const html = fs.readFileSync(path.join(projectDir, 'edu-store.html'), 'utf8');
const css = fs.readFileSync(path.join(projectDir, 'edu-store.css'), 'utf8');
const js = fs.readFileSync(path.join(projectDir, 'edu-store.js'), 'utf8');
const pdpHtml = fs.readFileSync(path.join(projectDir, 'product-detail.html'), 'utf8');
const pdpJs = fs.readFileSync(path.join(projectDir, 'product-detail.js'), 'utf8');
const translationsCode = fs.readFileSync(path.join(projectDir, 'translations.js'), 'utf8');

// 3. Canonical script order
const expectedScripts = [
  'translations.js',
  'products-data.js',
  'universal-i18n-bus.js',
  'header.js',
  'menu-manager.js',
  'auth-state.js',
  'shared-search.js',
  'edu-store.js'
];

let lastIndex = -1;
expectedScripts.forEach((scriptName) => {
  const index = html.indexOf(scriptName);
  assert(index !== -1, `edu-store.html must load ${scriptName}`);
  assert(index > lastIndex, `Script ${scriptName} is not in the canonical loading order`);
  lastIndex = index;
});
console.log('✓ Canonical script sequence verified.');

// 4. Required DOM contracts
const requiredIds = [
  'eduHero',
  'studentVerifySection',
  'studentIdInput',
  'collegeEmailInput',
  'verifyStudentBtn',
  'studentStatus',
  'semesterSection',
  'semesterSelect',
  'courseMaterialGrid',
  'discountEstimator',
  'cgpaRange',
  'categorySelect',
  'studentPriceEstimate',
  'backToCollegeGrid',
  'facultySection',
  'facultyCourseListForm',
  'courseCodeInput',
  'courseNameInput',
  'studentCountInput',
  'facultyListStatus',
  'facultyListPreview',
  'addFacultyListToCartBtn'
];

requiredIds.forEach((id) => {
  assert(html.includes(`id="${id}"`) || html.includes(`id='${id}'`), `edu-store.html must contain #${id}`);
});
['courseCode', 'courseName', 'studentCount'].forEach((name) => {
  assert(new RegExp(`name=["']${name}["']`).test(html), `Faculty control #${name} must have a name attribute`);
});
assert(/id=["']facultySubmitBtn["'][^>]*form=["']facultyCourseListForm["']/.test(html), 'Faculty submit button must target #facultyCourseListForm');
assert(html.includes('amazon-theme.css') && html.includes('shared-search.css'), 'Campus store must load shared storefront styles');
console.log('✓ Required DOM and form contracts verified.');

// 5. Theme and accessibility surfaces
assert(css.includes('--edu-accent') && css.includes('#4F46E5'), 'edu-store.css must define the campus indigo accent');
assert(css.includes('prefers-reduced-motion'), 'edu-store.css must respect reduced-motion preferences');
assert(css.includes('color: #ffffff') && css.includes('font-weight: 700'), 'Campus CTAs must use readable high-contrast text');
assert(css.includes('backdrop-filter') || css.includes('rgba'), 'edu-store.css must include layered surfaces');
console.log('✓ Theme and accessibility contracts verified.');

// 6. Controller, storage and pricing contracts
assert(js.includes('electromart_edu_student_profile_v1'), 'edu-store.js must persist the student profile');
assert(js.includes('electromart_edu_faculty_lists_v1'), 'edu-store.js must persist faculty course lists');
assert(js.includes('ElectroMart.EduStore') || js.includes('ElectroMartEduStore'), 'edu-store.js must use the approved ElectroMart namespace');
assert(js.includes('calculateStudentDiscount'), 'edu-store.js must expose the student discount engine');
assert(js.includes('calculateStudentPrice'), 'edu-store.js must expose the student price engine');
assert(js.includes('verifyStudentProfile'), 'edu-store.js must expose the student verification engine');

const sandbox = {
  window: {},
  document: {
    addEventListener: () => {},
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: () => ({})
  },
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  setTimeout: () => {},
  clearTimeout: () => {},
  Intl,
  Date,
  console
};
vm.createContext(sandbox);
vm.runInContext(js, sandbox);

const eduNamespace = sandbox.window.ElectroMart && sandbox.window.ElectroMart.EduStore;
assert(eduNamespace, 'window.ElectroMart.EduStore must exist after edu-store.js runs');
['calculateStudentDiscount', 'calculateStudentPrice', 'verifyStudentProfile', 'buildFacultyList'].forEach((fn) => {
  assert(typeof eduNamespace[fn] === 'function', `EduStore namespace must expose ${fn}()`);
});

// 6a. Deterministic student discount ladder
assert.strictEqual(eduNamespace.calculateStudentDiscount({ verified: false, cgpa: 90, category: 'textbook' }), 0,
  'Unverified students must receive no discount');
assert.strictEqual(eduNamespace.calculateStudentDiscount({ verified: true, cgpa: 80, category: 'textbook' }), 15,
  'Verified 80% CGPA textbook discount must be 15%');
assert.strictEqual(eduNamespace.calculateStudentDiscount({ verified: true, cgpa: 65, category: 'textbook' }), 10,
  'Verified 65% CGPA textbook discount must be 10%');
assert.strictEqual(eduNamespace.calculateStudentDiscount({ verified: true, cgpa: 80, category: 'electronics' }), 5,
  'Verified 80% CGPA electronics discount must be 5%');
assert.strictEqual(eduNamespace.calculateStudentDiscount({ verified: true, cgpa: 80, category: 'textbook' }),
  eduNamespace.calculateStudentDiscount({ verified: true, cgpa: 80, category: 'textbook' }),
  'Discount engine must be deterministic for identical input');

// 6b. Monotonic ladder: a higher CGPA is never worse than a lower one
const cgpaLadder = [45, 60, 75, 90].map((cgpa) =>
  eduNamespace.calculateStudentDiscount({ verified: true, cgpa, category: 'textbook' }));
for (let index = 1; index < cgpaLadder.length; index += 1) {
  assert(cgpaLadder[index] >= cgpaLadder[index - 1],
    `CGPA ${[45, 60, 75, 90][index]}% must not be discounted less than ${[45, 60, 75, 90][index - 1]}%`);
}

// 6c. INR student pricing, rounded to the nearest rupee
assert.strictEqual(eduNamespace.calculateStudentPrice({ basePrice: 1200, verified: true, cgpa: 80, category: 'textbook' }), 1020,
  '₹1,200 textbook at 15% must be ₹1,020');
assert.strictEqual(eduNamespace.calculateStudentPrice({ basePrice: 1200, verified: true, cgpa: 80, category: 'electronics' }), 1140,
  '₹1,200 electronics at 5% must be ₹1,140');
assert.strictEqual(eduNamespace.calculateStudentPrice({ basePrice: 1200, verified: false, cgpa: 80, category: 'textbook' }), 1200,
  'Unverified pricing must be unchanged');
assert.strictEqual(eduNamespace.calculateStudentPrice({ basePrice: 1499, verified: true, cgpa: 80, category: 'textbook' }), 1274,
  '₹1,499 textbook at 15% must round to ₹1,274');
assert(eduNamespace.calculateStudentPrice({ basePrice: 1499, verified: true, cgpa: 80, category: 'textbook' })
  < eduNamespace.calculateStudentPrice({ basePrice: 1499, verified: true, cgpa: 65, category: 'textbook' }),
  'A higher CGPA must never cost more');

// 6d. Deterministic local student verification
const verifiedProfile = eduNamespace.verifyStudentProfile({ studentId: 'STU2026A1', collegeEmail: 'a@iitb.ac.in' });
assert(verifiedProfile && verifiedProfile.verified === true, 'A valid .ac.in address with a valid student ID must verify');
const personalEmail = eduNamespace.verifyStudentProfile({ studentId: 'STU2026A1', collegeEmail: 'a@gmail.com' });
assert(personalEmail && personalEmail.verified === false, 'A personal email address must not verify');
const weakId = eduNamespace.verifyStudentProfile({ studentId: 'x', collegeEmail: 'a@iitb.ac.in' });
assert(weakId && weakId.verified === false, 'A malformed student ID must not verify');
assert(typeof (verifiedProfile.reason || '') === 'string' && verifiedProfile.reason.length > 0,
  'Verification must return human-readable reason text');

// 6e. Deterministic faculty course list
const facultyList = eduNamespace.buildFacultyList({ courseCode: 'CS204', courseName: 'Data Structures', studentCount: 60, perStudentCopyPrice: 249 });
assert(facultyList && facultyList.totalCopies === 60,
  'A 60-student class must produce 60 copies');
assert(typeof facultyList.totalPrice === 'number' && facultyList.totalPrice > 0, 'Faculty list must compute a total INR price');
assert(facultyList.totalPrice === eduNamespace.buildFacultyList({ courseCode: 'CS204', courseName: 'Data Structures', studentCount: 60, perStudentCopyPrice: 249 }).totalPrice,
  'Faculty list totals must be deterministic');
console.log('✓ Student pricing, verification and faculty list engines verified.');

// 7. PDP integration
assert(pdpHtml.includes('pdpStudentDiscountCallout') || pdpHtml.includes('pdpStudentDiscountBadge'),
  'product-detail.html must contain the student discount callout');
assert(pdpJs.includes('renderPdpStudentDiscountCallout'), 'product-detail.js must contain renderPdpStudentDiscountCallout');
assert(pdpHtml.includes('ElectroMart Campus Store: Verified Student Discount & Faculty Course Lists'),
  'PDP must render the Campus Store certification message');
console.log('✓ PDP student discount integration verified.');

// 8. 11-language i18n coverage
const i18nSandbox = {
  window: {},
  document: {
    addEventListener: () => {},
    querySelectorAll: () => [],
    getElementById: () => null,
    querySelector: () => null,
    createElement: () => ({})
  },
  localStorage: { getItem: () => null, setItem: () => {} },
  console
};
vm.createContext(i18nSandbox);
vm.runInContext(translationsCode, i18nSandbox);

const translations = i18nSandbox.window.EM_TRANSLATIONS;
assert(translations, 'window.EM_TRANSLATIONS must exist');
const expectedI18nKeys = [
  'edu_store_title',
  'edu_store_subtitle',
  'edu_verify_title',
  'edu_student_id_label',
  'edu_college_email_label',
  'edu_verify_btn',
  'edu_verified_status',
  'edu_local_only_note',
  'edu_semester_label',
  'edu_semester_select',
  'edu_course_material_title',
  'edu_discount_estimator_title',
  'edu_cgpa_label',
  'edu_category_label',
  'edu_student_price_label',
  'edu_back_to_college_title',
  'edu_faculty_title',
  'edu_faculty_course_code_label',
  'edu_faculty_course_name_label',
  'edu_faculty_student_count_label',
  'edu_faculty_submit_btn',
  'edu_pdp_badge'
];
languages.forEach((language) => {
  assert(translations[language], `Language ${language} must exist in translations`);
  expectedI18nKeys.forEach((key) => {
    assert(translations[language][key], `Key "${key}" must exist for language "${language}"`);
  });
});
assert(translationsCode.includes('ELECTROMART_EDU_I18N'), 'translations.js must expose ELECTROMART_EDU_I18N');
console.log('✓ All 11 Indian languages covered in translations.js.');

// 9. Brand safety
[html, css, js].forEach((source, index) => {
  const visibleSource = source
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/\b(?:src|href|class|id)=(['"])[^'"]*\1/gi, '')
    .replace(/<[^>]+>/g, ' ');
  assert(!/Amazon|अमेज़न/i.test(visibleSource), `${requiredFiles[index]} must be free of prohibited brand references`);
});
console.log('✓ Brand safety verified (100% pure ElectroMart).');

console.log('\n==================================================');
console.log('PASS: Phase 40 ElectroMart Student & Educator Campus Store contract verified successfully!');
console.log('==================================================');
