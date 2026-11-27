require('dotenv').config({ path: '.env' });

module.exports = {
  default: {
    requireModule: ['tsx/cjs'],

    paths: ['tests/ui/features/**/*.feature'],

    require: [
      'tests/support/**/*.ts',
      'tests/ui/step definition/**/*.ts'
    ],

    format: [
      'progress',
      'html:reports/cucumber-report.html',
      'json:reports/cucumber-report.json',
      'junit:reports/cucumber-report.xml'
    ]
  }
};