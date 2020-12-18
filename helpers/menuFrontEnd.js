/**
 *  Auxiliar para:
 *      - Almacenar de forma dinámica el menú del Dashboard,
 *      - Verificar el rol de usuario, y así mostrar elementos del menú especificos para administradores.
 */

const getMenuFrontEnd = (role) => {
    const menu = [
        { // Dashboard Menu
            title: 'Dashboard',
            icon: 'mdi mdi-gauge',
            submenu: [
                {titulo: 'Main', url: '/dashboard'},
                {titulo: 'Progress Bars', url: '/dashboard/progress'},
                {titulo: 'Angular Graphics', url: '/dashboard/grafica1'},
                {titulo: 'Promises', url: '/dashboard/promises'},
                {titulo: 'JavaScript RxJs', url: '/dashboard/rxjs'}
            ]
        },
        { // Maintenance Menu
            title: 'Maintenance',
            icon: 'mdi mdi-folder-lock-open',
            submenu: [
                // {titulo: 'Users', url: '/maintenance/users'},
                {titulo: 'Hospitals', url: '/maintenance/hospitals'},
                {titulo: 'Doctors', url: '/maintenance/doctors'}
            ]
        }
    ];

    if(role === 'ADMIN_ROLE') {
        menu[1].submenu.unshift(
            {titulo: 'Users', url: '/maintenance/users'}
        );

        menu.unshift(
            { // Maintenance Menu (Doctor & Medical Patient)
                title: 'Maintenance',
                icon: 'mdi mdi-folder-lock',
                submenu: [
                    {titulo: 'Doctors', url: '/maintenance/admin/doctors'},
                    {titulo: 'Medical Patients', url: '/maintenance/admin/medPatients'}
                ]
            }
        );
    };

    return menu;
}

module.exports = {
    getMenuFrontEnd
}