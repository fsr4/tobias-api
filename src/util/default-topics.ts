const defaultTopics = [
    {
        name: "Begrüßung",
    },
    {
        name: "Feststellung der Beschlussfähigkeit",
    },
    {
        name: "Beschluss der Tagesordnung",
    },
    {
        name: "Bestätigung der Protokolle",
    },
    {
        name: "Inforunde",
    },
    {
        name: "Finanzen",
    },
    {
        name: "Projekte",
    },
    {
        name: "Termine",
        subs: [
            {
                name: "Nächste Sitzung",
                parent: 8,
                position: 1,
            },
            {
                name: "Weitere Termine",
                parent: 8,
                position: 2,
            },
        ],
    },
    {
        name: "Sonstiges",
    },
];

export default defaultTopics;
