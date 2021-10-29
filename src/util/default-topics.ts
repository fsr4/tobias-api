export const defaultTopics = [
    {
        name: "Begrüßung",
        position: 1
    },
    {
        name: "Feststellung der Beschlussfähigkeit",
        position: 2
    },
    {
        name: "Beschluss der Tagesordnung",
        position: 3
    },
    {
        name: "Bestätigung der Protokolle",
        position: 4
    },
    {
        name: "Inforunde",
        position: 5
    },
    {
        name: "Finanzen",
        position: 6
    },
    {
        name: "Projekte",
        position: 7
    },
    {
        name: "Termine",
        position: 8
    },
    {
        name: "Sonstiges",
        position: 9
    }
];

export const defaultSubTopics = [
    {
        name: "Nächste Sitzung",
        parent: 8,
        position: 1,
    },
    {
        name: "Weitere Termine",
        parent: 8,
        position: 2
    }
];
