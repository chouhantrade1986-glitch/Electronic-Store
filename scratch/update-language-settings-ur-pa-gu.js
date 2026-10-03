const fs = require('fs');
const path = require('path');

const targetPath = path.join('C:', 'Users', 'Admin', 'Documents', 'GitHub', 'Electronic-Store', 'language-settings.html');
let content = fs.readFileSync(targetPath, 'utf8');

const mrRadioPattern = `              <label class="lang-option-row">
                <input type="radio" name="languagePref" value="mr" />
                <span class="lang-option-label">मराठी - MR</span>
                <span class="lang-option-translation">- भाषांतर</span>
              </label>`;

const newRadios = `              <label class="lang-option-row">
                <input type="radio" name="languagePref" value="mr" />
                <span class="lang-option-label">मराठी - MR</span>
                <span class="lang-option-translation">- भाषांतर</span>
              </label>

              <label class="lang-option-row">
                <input type="radio" name="languagePref" value="ur" />
                <span class="lang-option-label">اردو - UR</span>
                <span class="lang-option-translation">- ترجمہ</span>
              </label>

              <label class="lang-option-row">
                <input type="radio" name="languagePref" value="pa" />
                <span class="lang-option-label">ਪੰਜਾਬੀ - PA</span>
                <span class="lang-option-translation">- ਅਨੁਵਾਦ</span>
              </label>

              <label class="lang-option-row">
                <input type="radio" name="languagePref" value="gu" />
                <span class="lang-option-label">ગુજરાતી - GU</span>
                <span class="lang-option-translation">- અનુવાદ</span>
              </label>`;

if (content.includes(mrRadioPattern)) {
  content = content.replace(mrRadioPattern, newRadios);
} else {
  console.error("mrRadioPattern not found!");
  process.exit(1);
}

const mrFooterPattern = `<option value="mr">मराठी - MR</option>`;
const newFooterOptions = `<option value="mr">मराठी - MR</option>
          <option value="ur">اردو - UR</option>
          <option value="pa">ਪੰਜਾਬੀ - PA</option>
          <option value="gu">ગુજરાતી - GU</option>`;

if (content.includes(mrFooterPattern)) {
  content = content.replace(mrFooterPattern, newFooterOptions);
} else {
  console.error("mrFooterPattern not found!");
  process.exit(1);
}

fs.writeFileSync(targetPath, content, 'utf8');
console.log('Successfully updated language-settings.html with ur, pa, gu');
