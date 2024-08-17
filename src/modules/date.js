import moment from "moment";

function combineDateTime(date, time) {
    return moment(date + " " + time);
}

export const formatToDate = (dateTime) => {
    return moment(dateTime).format("YYYY-MM-DD");
};

export const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return formatToDate(result);
};

export const getTimeDiff = (firstDate, firstTime, secondDate, secondTime) => {
    const firstDateTime = combineDateTime(firstDate, firstTime);
    const secondDateTime = combineDateTime(secondDate, secondTime);

    const duration = moment.duration(secondDateTime.diff(firstDateTime));
    const minutes = duration.asMinutes();
    return minutes;
};
