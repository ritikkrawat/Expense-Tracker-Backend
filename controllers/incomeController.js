const xlsx = require('xlsx');
const Income = require('../models/Income');

// Add Income Source
exports.addIncome = async (req, res) => {
  const userId = req.user.id;

  try {
    const { icon, source, amount, date } = req.body;

    if (!source || !amount || !date) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newIncome = new Income({
      userId,
      icon,
      source,
      amount,
      date: new Date(date)
    });

    await newIncome.save();
    res.status(200).json(newIncome);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Get All Income Sources
exports.getAllIncome = async (req, res) => {
  const userId = req.user.id;

  try {
    const income = await Income.find({ userId }).sort({ date: -1 });
    res.json(income);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Delete Income Source
exports.deleteIncome = async (req, res) => {
  try {
    await Income.findByIdAndDelete(req.params.id);
    res.json({ message: 'Income deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ Update Income Source
exports.updateIncome = async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);

    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }

    // Check if the income belongs to the user making the request
    if (income.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { source, amount, date, icon } = req.body;

    income.source = source || income.source;
    income.amount = amount || income.amount;
    income.date = date ? new Date(date) : income.date;
    income.icon = icon || income.icon;

    const updatedIncome = await income.save();
    res.status(200).json(updatedIncome);
  } catch (error) {
    console.error("Error updating income:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// Download All Income Source as Excel
exports.downloadIncomeExcel = async (req, res) => {
  const userId = req.user.id;

  try {
    const income = await Income.find({ userId }).sort({ date: -1 });

    const data = income.map((item) => {
      const dateObj = new Date(item.date);
      const formattedDate = `${String(dateObj.getDate()).padStart(2, '0')}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${dateObj.getFullYear()}`;

      return {
        Source: item.source,
        Amount: item.amount,
        Date: formattedDate,
      };
    });

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(wb, ws, "Income");

    const excelBuffer = xlsx.write(wb, {
      type: "buffer",
      bookType: "xlsx",
    });

    res.setHeader("Content-Disposition", "attachment; filename=income_details.xlsx");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

    res.send(excelBuffer);
  } catch (error) {
    console.error("Excel download error:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};
