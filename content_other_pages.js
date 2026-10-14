// version : 0.4.1
//author : ara

let link = document.querySelector("#navType .subNav").getElementsByTagName("li")[2].getElementsByTagName('a')[0].href;
// console.log("link",link);
if(link != null && link != "null" && link !=undefined && link !="undefined"){
    fetch(link).then(r => r.text()).then(function(html) {
        // Initialize the DOM parser
        var parser = new DOMParser();
    
        // Parse the text
        var doc = parser.parseFromString(html, "text/html");
        var table_data = doc.querySelector(".table-bordered");
        // console.log("table_data",table_data);
        var row = table_data.getElementsByTagName("tr")[1];
        // console.log("ROW",row);
    
        const total_seconds = 59;
        var elapsed_time, remaining_time, leaving_time, hours, minutes, diff, startTime, total_time, current_time, date, current_date, second_ticks, time_completed_at;
    
    
        var label = document.createElement("LABEL");
        label.style.float = "right";
        label.style.padding = "40px";
        label.className = "display_time";
        label.innerHTML = "";
        document.getElementById("contentHeader").appendChild(label);
        var button = document.createElement("BUTTON");
        // FOR WEEKLY HOURS
        // var t = document.createTextNode("Current Week Hours");
        // button.appendChild(t);
        // button.id = "hours_weekly";
        // button.style.float = "right";
        // button.style.marginTop = "43px";
        // button.style.marginRight = "-4px";
        // button.style.padding = "6px 7px 5px 6px";
        // button.style.borderRadius = "4px";
        // button.style.background = "#fff";
        // document.getElementById("contentHeader").appendChild(button);
        displayTime();
    
    
    
    function displayTime() {
    
        date = new Date(row.getElementsByTagName("td")[1].innerText);
        current_date = new Date();
        calculate_time(); // function call
        var x = document.getElementById("contentHeader");
        var el = x.querySelector('.display_time');
        let break_time = row.getElementsByTagName("td")[3].innerText;
        let lunch_time = row.getElementsByTagName("td")[4].innerText;
        if (current_date.getDate() == date.getDate() && current_date.getMonth() == date.getMonth() && current_date.getFullYear() == date.getFullYear()) {
            // for version0.3.2 [time provisioning]
            // let in_time = row.getElementsByTagName("td")[6].innerText;
            // let name = (row.getElementsByTagName("td")[0].innerText).split(" ")[0];
            // console.log("remaining_time",remaining_time);
            if (remaining_time.split(":")[0] >= 0) {
                time_completed_at = tConvert(leaving_time);
                localStorage.setItem("time_ended_at", time_completed_at);
                el.innerHTML = `<span style = "font-size:12px;"> <b>Time Left : </b> ${remaining_time} </span>`; // replacing updated time
                if(lunch_time.trim() != "" && lunch_time.trim() != "-" && lunch_time.trim() != null){
                    el.style.padding = "30px";
                    el.innerHTML += `<span style = "font-size:12px;"><br/> <b>Lunch :</b> ${lunch_time}</span>`;
                }
                if(break_time.trim() != "" && break_time.trim() != "-" && break_time.trim() != null){
                    el.style.padding = "30px";
                    el.innerHTML += `<span style = "font-size:12px;"><br/> <b>Break :</b> ${break_time}</span>`;
                }
                el.innerHTML += `<span style = "font-size:14px; color:#424d42;"><br/><b>Completes at :  ${tConvert(leaving_time)}</b></span>`
                // for version0.3.2 [time provisioning]
                // if(in_time.split(":")[0] < 9){
                //     el.innerHTML += `<span style = "font-size:12px;"><br/> <b>${name}</b> nice to see you early. But, your time will be considered from <b>09:00 AM</b> </span>`;
                // }
            } else {
                let time_ended_at;
                if (time_completed_at != undefined && time_completed_at != "undefined" && time_completed_at != null && time_completed_at != "null") {
                    time_ended_at = time_completed_at;
                    // set the value in local storage
                    localStorage.setItem("time_ended_at", time_completed_at);
                } else {
                    // get from local storage
                    time_ended_at = localStorage.getItem("time_ended_at");
                }
                let additional_hrs = (Math.abs(remaining_time.split(":")[0]) - 1);
                let additional_mins = (Math.abs(remaining_time.split(":")[1]) - 1);
                let additional_time = (("00" + additional_hrs).substr(-2) + ":" + ("00" + additional_mins).substr(-2) + ":" + ("00" + current_date.getSeconds()).substr(-2));
                el.style.padding = "43px";
                el.innerHTML = `<span style = "font-size:12px;"><b>Completed at :  ${time_ended_at}</b> </span>` ; // replacing updated time
                if(lunch_time.trim() != "" && lunch_time.trim() != "-" && lunch_time.trim() != null){
                    el.style.padding = "30px";
                    el.innerHTML += `<span style = "font-size:12px;"><br/> <b>Lunch :</b> ${lunch_time}</span>`;
                }
                if(break_time.trim() != "" && break_time.trim() != "-" && break_time.trim() != null){
                    el.style.padding = "30px";
                    el.innerHTML += `<span style = "font-size:12px;"><br/> <b>Break :</b> ${break_time}</span>`;
                }
                el.innerHTML += `<span style = "font-size:14px; color:#424d42;"><br/><b>Additional Time : </b> ${additional_time} </span>`;
                // for version0.3.2 [time provisioning]
                // if(in_time.split(":")[0] < 9){
                //     el.innerHTML += `<span style = "font-size:12px;"><br/><b> ${name}</b> nice to see you early. But, your time will be considered from <b>09:00 AM</b> </span>`;
                // }
            }
        } else {
            // console.log("Today's Entry not available");
            button.style.marginTop = "38px";
            el.innerHTML = `<span style = "font-size:14px;">Today's data isn't available.</span>`;
            localStorage.removeItem("time_ended_at");
        }
        setTimeout(() => {
            elapsed_time, remaining_time, leaving_time, hours, minutes, diff, startTime, total_time, current_time, date, current_date = "";
            displayTime();
        }, 1000 * 1);
    }
    
    
    // time calculation
    function calculate_time() {
        date = new Date(row.getElementsByTagName("td")[1].innerText);
        current_date = new Date();
    
        let in_time = row.getElementsByTagName("td")[6].innerText;
    
        // FOR TIME PROVISIONING // for version0.3.2 [time provisioning]
        // if(in_time.split(":")[0] < 9){
        //     in_time = "09:00 am"
        // }
        let break_time = row.getElementsByTagName("td")[3].innerText;
        let lunch_time = row.getElementsByTagName("td")[4].innerText;
    
        let now_date = (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear()
        let timeStart = new Date(now_date + " " + in_time);
    
        diff = (current_date - timeStart) / 60000;
        // console.log("diff >>>", diff);
        minutes = diff % 60;
    
        hours = (diff - minutes) / 60;
        // console.log("hrs -->", hours);
        // console.log("mins -->", minutes);
        if (lunch_time.split("hrs").length == 2) {
            let lunch_hr_val = lunch_time.split("hrs")[0]
            let lunch_min_val = lunch_time.split("hrs")[1].split("min")[0];
            lunch_time = converToMinutes(lunch_hr_val + "." + lunch_min_val)
        } else {
            lunch_time = (lunch_time.trim() != "" && lunch_time.trim() != "-" && lunch_time.trim() != null) ? +(lunch_time.replace("min", "")) : 0
        }
        if (break_time.split("hrs").length == 2) {
            let break_hr_val = break_time.split("hrs")[0]
            let break_min_val = break_time.split("hrs")[1].split("min")[0];
            break_time = converToMinutes(break_hr_val + "." + break_min_val)
        } else {
            break_time = (break_time.trim() != "" && break_time.trim() != "-" && break_time.trim() != null) ? +(break_time.replace("min", "")) : 0
        }
        // console.log("1111 break_time",break_time);
        // console.log("1111 lunch_time",lunch_time);
        total_time = lunch_time + break_time
        // console.log("total_time --->",total_time);
        startTime = converToMinutes(hours + "." + minutes);
        elapsed_time = parseTime(startTime - total_time, current_date.getSeconds());
        // console.log("elapsed_time --->", elapsed_time);
        second_ticks = total_seconds - current_date.getSeconds();
        remaining_time = time_diff("08:01:00", elapsed_time, second_ticks);
        // console.log("remaining_time --->", remaining_time);
        current_time = current_date.getHours() + ":" + current_date.getMinutes() + ":" + current_date.getSeconds()
        leaving_time = addTime(remaining_time, current_time)
        // console.log("leaving_time --->", leaving_time);
    }
    
    // FOR WEEKLY HOURS
    // weekly calculations
    // document.getElementById("hours_weekly").addEventListener("click", function () {
    //     var working_hrs = [];
    //     var rowLength = table_data.rows.length;
    //     var start_day = get_days().startday;
    //     var end_day = get_days().endday;
    //     var s_day = start_day.getDate();
    //     var e_day = end_day.getDate();
    //     //loops through rows
    //     for (i = 1; i < rowLength; i++) {
    //         //gets cells of current row
    //         var oCells = table_data.rows.item(i).cells;
    //         //gets amount of cells of current row
    //         var table_date_today = oCells.item(1).innerHTML;
    
    //         let day = new Date(table_date_today).getDate();
    //         let month = new Date(table_date_today).getMonth();
    //         if (end_day.getMonth() > month) {
    //             e_day = 31;
    //         }
    //         if ((s_day <= day && day <= e_day) && (month == start_day.getMonth() || month == end_day.getMonth())) {
    //             working_hrs.push((oCells.item(5).innerHTML).trim());
    //         }
    //     }
    //     if (working_hrs.length > 0) {
    //         let total_hrs = 0;
    //         for (j = 0; j < working_hrs.length; j++) {
    //             if (working_hrs[j] == "-") {
    //                 working_hrs[j] = 0;
    //             } else {
    //                 let split_hrs = working_hrs[j].split("hrs")[0];
    //                 let split_mins = (working_hrs[j].split("hrs")[1]).split("min")[0];
    //                 split_mins = (split_mins > 0) ? split_mins : "00"
    //                 total_hrs += converToMinutes(split_hrs + "." + split_mins.trim())
    //             }
    //         }
    //         if (total_hrs > 0) {
    //             alert(`Total : ${timeConvert(total_hrs)} \n\n Note: Re-evaluation after removing filters might result in proper output if not getting proper result.`);
    //         } else {
    //             alert(`Data Inappropriate \n\n Note: Re-evaluation after removing filters might result in proper output if not getting proper result.`);
    //         }
    //     } else {
    //         alert("No data available. \n\n Note: Re-evaluation after removing filters might result in proper output if not getting proper result.");
    //     }
    // });
    
    function converToMinutes(s) {
        var c = s.split('.');
        return parseInt(c[0]) * 60 + parseInt(c[1]);
    }
    
    function parseTime(s, sec) {
        return Math.floor(parseInt(s) / 60) + ":" + parseInt(s) % 60 + ":" + sec
    }
    
    // add remaining time with current time
    function addTime(remaining_time, current_time) {
        var a = remaining_time.split(":");
        var seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (0);
        var b = current_time.split(":");
        var seconds2 = (+b[0]) * 60 * 60 + (+b[1]) * 60 + (0);
    
        var date = new Date(1970, 0, 1);
        date.setSeconds(seconds + seconds2);
    
        var c = date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
        return (c);
    }
    
    // subtract elapsed time from predefined time
    function time_diff(t1, t2, sec) {
        var t1parts = t1.split(':');
        var t1cm = Number(t1parts[0]) * 60 + Number(t1parts[1]);
    
        var t2parts = t2.split(':');
        var t2cm = Number(t2parts[0]) * 60 + Number(t2parts[1]);
    
        var hour = Math.floor((t1cm - t2cm) / 60);
        var min = Math.floor((t1cm - t2cm) % 60);
        return (("00" + hour).substr(-2) + ':' + ("00" + min).substr(-2) + ":" + ("00" + sec).substr(-2));
    }
    
    function tConvert(time) {
        // Check correct time format and split into components
        time = time.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];
    
        if (time.length > 1) { // If time format correct
            time = time.slice(1);  // Remove full string match value
            time[5] = +time[0] < 12 ? ' AM' : ' PM'; // Set AM/PM
            time[0] = +time[0] % 12 || 12; // Adjust hours
        }
        return time.join(''); // return adjusted time or original string
    }
    
    function get_days() {
        var today, todayNumber, mondayNumber, sundayNumber, monday, sunday;
        today = new Date();
        todayNumber = today.getDay();
        mondayNumber = 1 - todayNumber;
        sundayNumber = 7 - todayNumber;
        monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + mondayNumber);
        sunday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + sundayNumber);
        return ({ startday: monday, endday: sunday })
    }
    function timeConvert(n) {
        var num = n;
        var hours = (num / 60);
        var rhours = Math.floor(hours);
        var minutes = (hours - rhours) * 60;
        var rminutes = Math.round(minutes);
        return rhours + " hour(s) and " + rminutes + " minute(s).";
    }
    })
}
