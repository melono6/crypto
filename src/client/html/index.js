var date = new Date(),
    string = "";

string += date.getFullYear();
string += date.getDate();
string += date.getMinutes();
string += date.getSeconds();

module.exports = {
    date: string
};