async function deleteAll() {
    if(confirm('Alle Bestellungen Löschen?')) {
        const res = await fetch('/admin/delete', { method: 'delete' });
        if(res.status != 200) {
            alert(await res.text());
        }
        location.reload();
    }
}

