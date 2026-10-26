module.exports = {
  default: {
    requireModule: ['tsx/cjs'],

    require: [
      'tests/support/**/*.ts',
      'tests/ui/step definition/**/*.ts'
    ],

    paths: ['tests/ui/features/**/*.feature'],

    format: [
      'progress',
      'html:reports/cucumber-report.html',
      'json:reports/cucumber-report.json',
      'junit:reports/cucumber-report.xml'
    ]
  }
};