const pool = require("../../config/database");

module.exports = {
    insertUsrWords:(data, callback) => {
    let words = data.taskName + data.taskDes + data.taskNotification + data.taskType;
        pool.query(
            `insert into words(words, uid)values(?,?)`,
            [words, data.uid],
            (error, result, field) => {
                if (error) {
                    console.log(error);
                    return callback(error);
                }
                return callback(result);
            }
        );
    },

}