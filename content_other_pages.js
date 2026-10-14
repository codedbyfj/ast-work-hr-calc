// version : 0.4.1
//author : ara

let link = document
    .querySelector("#navType .subNav")
    .getElementsByTagName("li")[2]
    .getElementsByTagName("a")[0].href;
if (
    link != null &&
    link != "null" &&
    link != undefined &&
    link != "undefined"
) {
    fetch(link)
        .then((r) => r.text())
        .then(function (html) {
            // Initialize the DOM parser
            var parser = new DOMParser();

            // Parse the text
            var doc = parser.parseFromString(html, "text/html");
            var table_data = doc.querySelector(".table-bordered");
            var row = table_data.getElementsByTagName("tr")[1];

            const total_seconds = 59;
            var elapsed_time,
                remaining_time,
                leaving_time,
                hours,
                minutes,
                diff,
                startTime,
                total_time,
                current_time,
                date,
                current_date,
                second_ticks,
                time_completed_at;

            var label = document.createElement("LABEL");
            label.style.float = "right";
            label.style.padding = "40px";
            label.className = "display_time";
            label.innerHTML = "";
            document.getElementById("contentHeader").appendChild(label);

            displayTime();

            function displayTime() {
                date = new Date(row.getElementsByTagName("td")[1].innerText);
                current_date = new Date();
                calculate_time(); // function call
                var x = document.getElementById("contentHeader");
                var el = x.querySelector(".display_time");
                let break_time = row.getElementsByTagName("td")[3].innerText;
                let lunch_time = row.getElementsByTagName("td")[4].innerText;
                if (
                    current_date.getDate() == date.getDate() &&
                    current_date.getMonth() == date.getMonth() &&
                    current_date.getFullYear() == date.getFullYear()
                ) {
                    if (remaining_time.split(":")[0] >= 0) {
                        time_completed_at = tConvert(leaving_time);
                        localStorage.setItem("time_ended_at", time_completed_at);
                        el.innerHTML = `<span style = "font-size:12px;"> <b>Time Left : </b> ${remaining_time} </span>`; // replacing updated time
                        if (
                            lunch_time.trim() != "" &&
                            lunch_time.trim() != "-" &&
                            lunch_time.trim() != null
                        ) {
                            el.style.padding = "30px";
                            el.innerHTML += `<span style = "font-size:12px;"><br/> <b>Lunch :</b> ${lunch_time}</span>`;
                        }
                        if (
                            break_time.trim() != "" &&
                            break_time.trim() != "-" &&
                            break_time.trim() != null
                        ) {
                            el.style.padding = "30px";
                            el.innerHTML += `<span style = "font-size:12px;"><br/> <b>Break :</b> ${break_time}</span>`;
                        }
                        el.innerHTML += `<span style = "font-size:14px; color:#424d42;"><br/><b>Completes at :  ${tConvert(leaving_time)}</b></span>`;
                    } else {
                        let time_ended_at;
                        if (
                            time_completed_at != undefined &&
                            time_completed_at != "undefined" &&
                            time_completed_at != null &&
                            time_completed_at != "null"
                        ) {
                            time_ended_at = time_completed_at;
                            // set the value in local storage
                            localStorage.setItem("time_ended_at", time_completed_at);
                        } else {
                            // get from local storage
                            time_ended_at = localStorage.getItem("time_ended_at");
                        }
                        let additional_hrs = Math.abs(remaining_time.split(":")[0]) - 1;
                        let additional_mins = Math.abs(remaining_time.split(":")[1]) - 1;
                        let additional_time =
                            ("00" + additional_hrs).substr(-2) +
                            ":" +
                            ("00" + additional_mins).substr(-2) +
                            ":" +
                            ("00" + current_date.getSeconds()).substr(-2);
                        el.style.padding = "43px";
                        el.innerHTML = `<span style = "font-size:12px;"><b>Completed at :  ${time_ended_at}</b> </span>`; // replacing updated time
                        if (
                            lunch_time.trim() != "" &&
                            lunch_time.trim() != "-" &&
                            lunch_time.trim() != null
                        ) {
                            el.style.padding = "30px";
                            el.innerHTML += `<span style = "font-size:12px;"><br/> <b>Lunch :</b> ${lunch_time}</span>`;
                        }
                        if (
                            break_time.trim() != "" &&
                            break_time.trim() != "-" &&
                            break_time.trim() != null
                        ) {
                            el.style.padding = "30px";
                            el.innerHTML += `<span style = "font-size:12px;"><br/> <b>Break :</b> ${break_time}</span>`;
                        }
                        el.innerHTML += `<span style = "font-size:14px; color:#424d42;"><br/><b>Additional Time : </b> ${additional_time} </span>`;
                    }
                } else {
                    el.innerHTML = `<span style = "font-size:14px;">Today's data isn't available.</span>`;
                    localStorage.removeItem("time_ended_at");
                }
                setTimeout(() => {
                    (elapsed_time,
                        remaining_time,
                        leaving_time,
                        hours,
                        minutes,
                        diff,
                        startTime,
                        total_time,
                        current_time,
                        date,
                        (current_date = ""));
                    displayTime();
                }, 1000 * 1);
            }

            // time calculation
            function calculate_time() {
                date = new Date(row.getElementsByTagName("td")[1].innerText);
                current_date = new Date();

                let in_time = row.getElementsByTagName("td")[6].innerText;
                let break_time = row.getElementsByTagName("td")[3].innerText;
                let lunch_time = row.getElementsByTagName("td")[4].innerText;

                let now_date =
                    date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear();
                let timeStart = new Date(now_date + " " + in_time);

                diff = (current_date - timeStart) / 60000;
                minutes = diff % 60;

                hours = (diff - minutes) / 60;
                if (lunch_time.split("hrs").length == 2) {
                    let lunch_hr_val = lunch_time.split("hrs")[0];
                    let lunch_min_val = lunch_time.split("hrs")[1].split("min")[0];
                    lunch_time = converToMinutes(lunch_hr_val + "." + lunch_min_val);
                } else {
                    lunch_time =
                        lunch_time.trim() != "" &&
                            lunch_time.trim() != "-" &&
                            lunch_time.trim() != null
                            ? +lunch_time.replace("min", "")
                            : 0;
                }
                if (break_time.split("hrs").length == 2) {
                    let break_hr_val = break_time.split("hrs")[0];
                    let break_min_val = break_time.split("hrs")[1].split("min")[0];
                    break_time = converToMinutes(break_hr_val + "." + break_min_val);
                } else {
                    break_time =
                        break_time.trim() != "" &&
                            break_time.trim() != "-" &&
                            break_time.trim() != null
                            ? +break_time.replace("min", "")
                            : 0;
                }
                total_time = lunch_time + break_time;
                startTime = converToMinutes(hours + "." + minutes);
                elapsed_time = parseTime(
                    startTime - total_time,
                    current_date.getSeconds(),
                );
                second_ticks = total_seconds - current_date.getSeconds();
                remaining_time = time_diff("08:01:00", elapsed_time, second_ticks);
                current_time =
                    current_date.getHours() +
                    ":" +
                    current_date.getMinutes() +
                    ":" +
                    current_date.getSeconds();
                leaving_time = addTime(remaining_time, current_time);
            }

            function converToMinutes(s) {
                var c = s.split(".");
                return parseInt(c[0]) * 60 + parseInt(c[1]);
            }

            function parseTime(s, sec) {
                return (
                    Math.floor(parseInt(s) / 60) + ":" + (parseInt(s) % 60) + ":" + sec
                );
            }

            // add remaining time with current time
            function addTime(remaining_time, current_time) {
                var a = remaining_time.split(":");
                var seconds = +a[0] * 60 * 60 + +a[1] * 60 + 0;
                var b = current_time.split(":");
                var seconds2 = +b[0] * 60 * 60 + +b[1] * 60 + 0;

                var date = new Date(1970, 0, 1);
                date.setSeconds(seconds + seconds2);

                var c = date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
                return c;
            }

            // subtract elapsed time from predefined time
            function time_diff(t1, t2, sec) {
                var t1parts = t1.split(":");
                var t1cm = Number(t1parts[0]) * 60 + Number(t1parts[1]);

                var t2parts = t2.split(":");
                var t2cm = Number(t2parts[0]) * 60 + Number(t2parts[1]);

                var hour = Math.floor((t1cm - t2cm) / 60);
                var min = Math.floor((t1cm - t2cm) % 60);
                return (
                    ("00" + hour).substr(-2) +
                    ":" +
                    ("00" + min).substr(-2) +
                    ":" +
                    ("00" + sec).substr(-2)
                );
            }

            function tConvert(time) {
                // Check correct time format and split into components
                time = time
                    .toString()
                    .match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

                if (time.length > 1) {
                    // If time format correct
                    time = time.slice(1); // Remove full string match value
                    time[5] = +time[0] < 12 ? " AM" : " PM"; // Set AM/PM
                    time[0] = +time[0] % 12 || 12; // Adjust hours
                }
                return time.join(""); // return adjusted time or original string
            }
        });
}
