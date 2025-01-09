const searchInput = document.getElementById('search');
searchInput.oninput = () => {
    const query = searchInput.value.toLowerCase();
    const dishes = document.getElementsByClassName('o-container');

    if (query.trim().length === 0) {
        for (const element of dishes) {
            element.style.display = '';
        }
        return;
    }

    for (const element of dishes) {
        if (element.innerText.toLowerCase().includes(query)) {
            element.style.display = '';
        } else {
            element.style.display = 'none';
        }
    }
}

function toggleView(id) {
    const element = document.getElementById(id);
    element.style.display = element.style.display == 'none' ? 'block' : 'none'; 
}

async function deleteAll() {
    if (!confirm('Alle Bestellungen Löschen?')) {
        return;
    }

    const res = await fetch('/admin/delete-all', { method: 'delete' });
    if (res.status != 200) {
        alert(await res.text());
    }
    location.reload();

}

async function deleteOne(code, name) {
    if (!confirm(`${code} von '${name}' Löschen?`)) {
        return;
    }

    const res = await fetch('/admin/delete', {
        method: 'delete',
        body: JSON.stringify({ code: code }),
        headers: {
            "Content-Type": "application/json"
        }
    });

    if (res.status != 200) {
        alert(await res.text());
    }

    location.reload();
}

async function setLock(locked) {
    const res = await fetch('/admin/lock', {
        method: 'post',
        body: JSON.stringify({ locked: locked }),
        headers: {
            "Content-Type": "application/json"
        }
    });

    if (res.status != 200) {
        alert(await res.text());
    }

    location.reload();
}

async function setPayed(code, payed) {
    const res = await fetch('/admin/set-payed', {
        method: 'post',
        body: JSON.stringify({ payed: payed, code: code }),
        headers: {
            "Content-Type": "application/json"
        }
    });

    if (res.status != 200) {
        alert(await res.text());
    }

    location.reload();
}
