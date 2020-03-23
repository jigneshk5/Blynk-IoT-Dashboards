const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = Schema({
  email: {type: String, required: true},
  password: {type: String, required: true},
  registerAt: {
      type: Date,
      default: Date.now
    },
  widgets: {
    toggle_red: {type: Number, default:0},
    toggle_green: {type: Number, default:0},
    slider: {type: Number, default:0},
    line_chart:{
        first: { value: Number, when: Date, default:0 },
        second: { value: Number, when: Date, default:0 },
        third: { value: Number, when: Date, default:0 },
        fourth: { value: Number, when: Date, default:0 },
        fifth: { value: Number, when: Date, default:0 }
    },
    gauge: {type: Number, min:200, max: 750, default:200}
  }
});
module.exports = mongoose.model("User", userSchema);