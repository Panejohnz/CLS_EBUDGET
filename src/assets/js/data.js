async function confirmAlert(icon, title, text) {
    var confirm = false;

    await Swal.fire({
        width: '400px',
        title: title,
        icon: icon,
        text: text,
        showDenyButton: true,
        confirmButtonColor: '#0d6efd',
        confirmButtonText: 'ยืนยัน',
        denyButtonText: 'ยกเลิก',

    }).then((result) => {
        if (result.isConfirmed) {
            confirm = true;
        }
    });
    return confirm;
}

async function confirmAlertCount(icon, title, html) {
    return new Promise((resolve) => {
        Swal.fire({
            showDenyButton: true,
            confirmButtonText: 'ยืนยัน',
            denyButtonText: 'ยกเลิก',
            showCloseButton: true,
            width: 'fit-content',
            title: title,
            icon: icon,
            html: html, // เปลี่ยนจาก text เป็น html ตามชื่อ parameter
            timer: 2500,
            timerProgressBar: true,
            allowOutsideClick: false, // ปิดการคลิกนอก alert
            didOpen: () => {
                const progressBar = Swal.getTimerProgressBar();
                if (progressBar) {
                    progressBar.style.backgroundColor = '#0d6efd';
                    progressBar.style.height = '5px';
                }
            },
        }).then((result) => {
            if (result.isConfirmed) {
                resolve(true); // กดปุ่ม "ตกลง" -> return true
            } else {
                resolve(false); // เวลาหมดหรือปิด alert -> return false
            }
        });
    });
}





async function basicAlert(icon, title, text) {
    await Swal.fire(
        {

            confirmButtonColor: "#0d6efd",
            confirmButtonText: 'ตกลง',
            showCloseButton: true,
            title: title,
            text: text,
            icon: icon,
            // confirmButtonColor: '#198754',
        }
    )
    return true
}
async function basicAlert_free_w(icon, title, text) {
    await Swal.fire(
        {
            confirmButtonColor: "#0d6efd",
            confirmButtonText: 'ตกลง',
            showCloseButton: true,
            title: title,
            text: text,
            icon: icon,
            width: '1000px'
            // confirmButtonColor: '#198754',
        }
    )
    return true
}
async function basicAlertWithHTML(icon, title, html) {
    return new Promise((resolve) => {
        Swal.fire({
            confirmButtonColor: "#0d6efd",
            confirmButtonText: 'ตกลง',
            showCloseButton: true,
            title: title,
            html: html,
            icon: icon,
            timer: 8000,
            timerProgressBar: true,

            allowOutsideClick: false, // ปิดการคลิกนอก alert

            preConfirm: () => {
                return false; // ป้องกันการปิด alert โดยการกด Enter
            },
            didOpen: () => {
                const progressBar = Swal.getTimerProgressBar();
                if (progressBar) {
                    progressBar.style.backgroundColor = '#0d6efd';
                    progressBar.style.height = '5px';
                }
            },
        }).then(() => {
            resolve(true);
        });
    });
}
async function basicAlertAutoClose(icon, title, text) {
    await Swal.fire(
        {
            confirmButtonColor: "#0d6efd",
            showCloseButton: true,
            title: title,
            text: text,
            icon: icon,
            timer: 2500,
            // confirmButtonColor: '#198754',
        }
    )
    return true
}
async function documentSaveAlert(icon, title, text) {
    var confirm = false;
    await Swal.fire(
        {
            confirmButtonColor: "#01067D",
            confirmButtonText: "ตกลง",
            showCloseButton: true,
            title: title,
            text: text,
            icon: icon,
        }
    ).then((result) => {
        if (result.isConfirmed) {
            confirm = true;
        }
    });
    return confirm;
}
function engOnly(value) {
    return value.replace(/[^A-Za-z%()/'._-\s]/g, '');
}
function thaiOnly(value) {
    return value.replace(/[^ๅภถุึคตจขชๆไำพะัีรนยบลฃฟหกดเ้่าสวงผปแอิืทมใฝ๑๒๓๔ู๕๖๗๘๙๐ฎฑธํ๊ณฯญฐฅฤฆฏโฌ็๋ษศซฉฮฺ์ฒฬฦ\s]/g, '');
}
function ThainEng(value) {
    return value.replace(/[^ๅภถุึคตจขชๆไำพะัีรนยบลฃฟหกดเ้่าสวงผปแอิืทมใฝ๑๒๓๔ู๕๖๗๘๙๐ฎฑธํ๊ณฯญฐฅฤฆฏโฌ็๋ษศซฉฮฺ์ฒฬฦA-Za-z\s]/g, '');
}

function numOnly(value) {
    return value.replace(/[^0-9\.]+/g, '');
}

function numKaOnly(value) {
    return value.replace(/[^1+2+3\.]+/g, '');
}
function NoneType(value) {
    return value.replace(/[^]+/g, '');
}

async function confirmAlert2(icon, title, text) {
    var confirm = false;
    const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
            confirmButton: 'btn btn-success',
            cancelButton: 'btn btn-danger mr-2'
        },
        buttonsStyling: false
    })

    await swalWithBootstrapButtons.fire({
        title: title,
        text: text,
        icon: icon,
        showCancelButton: true,
        confirmButtonText: 'ใช่',
        cancelButtonText: 'ไม่ใช่',
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            swalWithBootstrapButtons.fire(
                'ลบข้อมูลเรียบร้อยแล้ว',
                '',
                'success'
            );
            confirm = true;
        }
    });

    return confirm;

}

async function confirmAlert3(icon, title, text) {
    var confirm = false;
    await Swal.fire({
        icon: icon,
        title: title,
        text: text,
        showDenyButton: true,
        denyButtonText: 'ยกเลิก',
        confirmButtonText: 'ยืนยัน',
        confirmButtonColor: '#28a745',
    }).then(async res => {
        if (res.isConfirmed) {
            confirm = true;
        }
    });

    return confirm;
}





function CalAge(BIRTHDATEYear) {
    let datenow = new Date();
    let dateTH = datenow.toLocaleString('th', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    console.log('BIRTHDATEYear:', BIRTHDATEYear);
    return Number(dateTH.split('/')[2]) - (Number(BIRTHDATEYear))
}

function topFunction() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}

async function cancelTracking() {
    const { value: text } = await Swal.fire({
        showCancelButton: true,
        confirmButtonColor: '#0d6efd',
        confirmButtonText: 'ยืนยัน',
        cancelButtonText: 'ยกเลิก',
        input: "textarea",
        inputLabel: "หมายเหตุ ยกเลิก :",
        inputPlaceholder: "....",
        inputAttributes: {
            "aria-label": "Type your message here"
        },
    });

    return text;
}