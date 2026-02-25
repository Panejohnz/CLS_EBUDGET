export const environment = {
  production: true,
  defaultauth: 'fakebackend',
  firebaseConfig: {
    apiKey: '',
    authDomain: '',
    databaseURL: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    measurementId: ''
  },

  // emonitor Api
  EMO_API: location.origin + "/CLS_EMONITOR_KPI/",
  DownloadExamUrl: location.origin + "/CLS_EMONITOR_KPI/DownLoad_File/Download_File_TEMPLATE",
  PreviewExamUrl: location.origin + "/CLS_EMONITOR_KPI/DownLoad_File/Preview_File_Template",
  GET_AUTHEN: location.origin + "/CLS_EMONITOR_KPI/GET_DATA/GET_AUTHEN",
  GET_MENU: location.origin + "/CLS_EMONITOR_KPI/GET_DATA/GetMenu",

  // EMO_API: location.origin + "/CLS_EMONITOR_KPI_DEMO/",
  // DownloadExamUrl: location.origin + "/CLS_EMONITOR_KPI_DEMO/DownLoad_File/Download_File_TEMPLATE",
  // PreviewExamUrl: location.origin + "/CLS_EMONITOR_KPI_DEMO/DownLoad_File/Preview_File_Template",
  // GET_AUTHEN: location.origin + "/CLS_EMONITOR_KPI_DEMO/GET_DATA/GET_AUTHEN",
  // GET_MENU: location.origin + "/CLS_EMONITOR_KPI_DEMO/GET_DATA/GetMenu",

  // เพิ่ม endpoint สำหรับ menu
  EXPORT_REPORT: 'https://fdaemonitor.fda.moph.go.th/CLS_EMONITOR_KPI_REPORT/Report/Report_R002.aspx',

  // ----------------------------------------------------------------------------

  // -------------------------------------------------------------------------------------------------------------------------

};
