async function deleteAll() {
    if(confirm('Alle Bestellungen Löschen?')) {
        const res = await fetch('/admin/delete', { method: 'delete' });
        if(res.status != 200) {
            alert(await res.text());
        }
        location.reload();
    }
}

async function setLock(locked) {
    const res = await fetch('/admin/lock', {
        method: 'post',
        body: JSON.stringify({locked: locked}),
        headers: {
            "Content-Type": "application/json"
        }
    });

    if(res.status != 200) {
        alert(await res.text());
    }

    location.reload();
}

async function setPayed(code, payed) {
    const res = await fetch('/admin/set-payed', {
        method: 'post',
        body: JSON.stringify({payed: payed, code: code}),
        headers: {
            "Content-Type": "application/json"
        }
    });

    if(res.status != 200) {
        alert(await res.text());
    }

    location.reload();
}
