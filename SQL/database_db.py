import sqlite3

connect=sqlite3.connect('database.db')

cursor=connect.cursor()
cursor.execute("""
    CREATE TABLE IF NOT EXISTS paintings(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
TITLE TEXT NOT NULL,
ARTIST TEXT NOT NULL,
MUSEUM TEXT,
YEAR INTEGER,
DESCRIPTION TEXT
)""")

paintings = [
    ("Daniel in the Lions’ Den", "Briton Rivière", "Manchester Art Gallery", 1872, "Depiction of biblical Daniel among lions."),
    ("Christ among the Doctors", "Albrecht Dürer", "Museo del Prado", 1506, "Young Christ discussing with scholars."),
    ("The Nightmare", "Henry Fuseli", "Detroit Institute of Arts", 1781, "Famous Romantic painting depicting a woman in distress.")
]

cursor.executemany("""
INSERT INTO Paintings (title, artist, museum, year, description)
VALUES (?, ?, ?, ?, ?)
""", paintings)

connect.commit()

cursor.execute("SELECT * FROM paintings")

rows = cursor.fetchall()
for row in rows:
    print(row)
    
    connect.close()