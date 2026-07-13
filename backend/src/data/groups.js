const groups = [
  {
    id: "1",
    name: "Goa Trip",

    members: [
      "Lavanya",
      "Ayush",
      "Riya",
      "Aditya",
      "Rahul",
      "Neha",
      "Karan"
    ],

    expenses: [
      {
        id: 1,
        title: "Dinner",
        amount: 2000,
        paidBy: "Lavanya",

        participants: [
          "Lavanya",
          "Ayush",
          "Riya",
          "Aditya"
        ],

        date: "15 Jun"
      },

      {
        id: 2,
        title: "Hotel Booking",
        amount: 6000,
        paidBy: "Ayush",

        participants: [
          "Lavanya",
          "Ayush",
          "Rahul",
          "Neha"
        ],

        date: "14 Jun"
      }
    ]
  },

  {
    id: "2",
    name: "Flat Expenses",

    members: [
      "Lavanya",
      "Ayush",
      "Riya",
      "Kabir"
    ],

    expenses: [
      {
        id: 1,
        title: "Electricity Bill",
        amount: 2500,
        paidBy: "Riya",

        participants: [
          "Lavanya",
          "Ayush",
          "Riya",
          "Kabir"
        ],

        date: "12 Jun"
      },

      {
        id: 2,
        title: "Groceries",
        amount: 1800,
        paidBy: "Kabir",

        participants: [
          "Lavanya",
          "Ayush",
          "Kabir"
        ],

        date: "10 Jun"
      },

      {
        id: 3,
        title: "Pet Food",
        amount: 3000,
        paidBy: "Lavanya",

        participants: [
          "Lavanya",
          "Kabir"
        ],

        date: "5 Jun"
      }
    ]
  },

  {
    id: "3",
    name: "College Friends",

    members: [
      "Lavanya",
      "Riya",
      "Ayush",
      "Ankit",
      "Priya",
      "Harsh",
      "Neha",
      "Karan",
      "Ishita",
      "Rahul"
    ],

    totalExpense: 1200,
    youOwe: 0,
    youAreOwed: 700,

    expenses: [
      {
        id: 1,
        title: "Movie Tickets",
        amount: 1200,
        paidBy: "Lavanya",

        participants: [
          "Lavanya",
          "Riya",
          "Ayush",
          "Ankit"
        ],

        date: "08 Jun"
      }
    ]
  }
];

module.exports = groups;