-- npx wrangler d1 execute ehentai-toplist-archive --local --file=./src/db/mock.sql
-- npx wrangler d1 execute ehentai-toplist-archive --local --command="SELECT * FROM galleries"

DROP TABLE IF EXISTS galleries;
DROP TABLE IF EXISTS toplist_items_2023;
DROP TABLE IF EXISTS toplist_items_2024;
DROP TABLE IF EXISTS toplist_items_2025;

CREATE TABLE IF NOT EXISTS galleries (
    gallery_id INTEGER PRIMARY KEY,
    gallery_name TEXT,
    gallery_type TEXT,
    tags TEXT,
    published_time TEXT,
    uploader TEXT,
    gallery_length INTEGER,
    points INTEGER,
    torrents_url TEXT,
    preview_url TEXT,
    gallery_url TEXT
);
CREATE INDEX gallery_id_idx ON galleries (gallery_id);

CREATE TABLE IF NOT EXISTS toplist_items_2023 (
    gallery_id INTEGER,
    rank INTEGER,
    list_date TEXT,
    period_type TEXT,
    PRIMARY KEY (gallery_id, rank, list_date, period_type)
);
CREATE INDEX list_date_idx_2023 ON toplist_items_2023 (list_date);

CREATE TABLE IF NOT EXISTS toplist_items_2024 (
    gallery_id INTEGER,
    rank INTEGER,
    list_date TEXT,
    period_type TEXT,
    PRIMARY KEY (gallery_id, rank, list_date, period_type)
);
CREATE INDEX list_date_idx_2024 ON toplist_items_2024 (list_date);

CREATE TABLE IF NOT EXISTS toplist_items_2025 (
    gallery_id INTEGER,
    rank INTEGER,
    list_date TEXT,
    period_type TEXT,
    PRIMARY KEY (gallery_id, rank, list_date, period_type)
);
CREATE INDEX list_date_idx_2025 ON toplist_items_2025 (list_date);

INSERT INTO galleries (gallery_id, gallery_name, gallery_type, tags, published_time, uploader, gallery_length, points, torrents_url, preview_url, gallery_url) 
VALUES (596447, '[LemonFont] Shapeshifter Part 1-3', 'Western', 'english, f:anal, f:bbw, f:big balls, f:big breasts, f:breast expansion, f:catgirl, f:corruption, f:dark skin, f:demon girl, f:exhibitionism, f:facesitting', '2013-05-27', 'Project_Demise', 345, 154632600, 'https://e-hentai.org/gallerytorrents.php?gid=596447&t=3894f02c20', 'https://ehgt.org/2b/ae/2bae2cd65255d1ac661649a91a422317ac51925f-252950-1157-722-png_250.jpg', 'https://e-hentai.org/g/596447/3894f02c20/');
INSERT INTO galleries (gallery_id, gallery_name, gallery_type, tags, published_time, uploader, gallery_length, points, torrents_url, preview_url, gallery_url)
VALUES (508505, 'GAME OVER', 'Image Set', 'f:ahegao, f:asphyxiation, f:big breasts, f:blindfold, f:bondage, f:bukkake, f:femdom, f:gokkun, f:impregnation, f:nakadashi, f:pillory, f:rape', '2012-07-15', 'pocky00', 800, 125985885, 'https://e-hentai.org/gallerytorrents.php?gid=508505&t=6b3c6730f0', 'https://ehgt.org/82/26/8226808ac9fe62d2980d4d4885e50ec18fcb6769-486008-1000-1430-jpg_250.jpg', 'https://e-hentai.org/g/508505/6b3c6730f0/');
INSERT INTO galleries (gallery_id, gallery_name, gallery_type, tags, published_time, uploader, gallery_length, points, torrents_url, preview_url, gallery_url)
VALUES (722215, '[May-Be Soft] Change! ~Anoko ni Natte Kunkun Peropero~', 'Game CG', 'f:anal, f:apron, f:big breasts, f:body swap, f:bondage, f:catgirl, f:cheerleader, f:cosplaying, f:defloration, f:exhibitionism, f:eyepatch, f:facesitting', '2014-07-25', 'pocky00', 812, 116446050, 'https://e-hentai.org/gallerytorrents.php?gid=722215&t=9904aa3d38', 'https://ehgt.org/07/48/0748f89705880bea60de128321cac0dee97d5ae9-129924-350-500-jpg_250.jpg', 'https://e-hentai.org/g/722215/9904aa3d38/');
INSERT INTO galleries (gallery_id, gallery_name, gallery_type, tags, published_time, uploader, gallery_length, points, torrents_url, preview_url, gallery_url)
VALUES (2055704, '[保安] 人妻舅妈淫堕记 1-5', 'Misc', 'chinese, f:big breasts, f:footjob, f:glasses, f:mother, f:netorare, f:pantyhose, 3d, story arc', '2021-11-08', '思覺失調', 1599, 18773950, 'https://e-hentai.org/gallerytorrents.php?gid=2055704&t=9d078905a6', 'https://ehgt.org/57/2b/572bdbe9dec0f1333e026d8f332a4e4c165381c3-141407-1600-900-jpg_250.jpg', 'https://e-hentai.org/g/2055704/9d078905a6/');
INSERT INTO galleries (gallery_id, gallery_name, gallery_type, tags, published_time, uploader, gallery_length, points, torrents_url, preview_url, gallery_url)
VALUES (1284427, 'Artist- Sakimichan', 'Western', 'f:big breasts, f:bikini, f:eggs, f:elf, f:glasses, f:magical girl, f:monster girl, f:ponytail, f:schoolgirl uniform, f:stockings, f:swimsuit, f:tentacles', '2018-09-09', 'Hentai Freak Lover', 1698, 88666950, 'https://e-hentai.org/gallerytorrents.php?gid=1284427&t=35de67170e', 'https://ehgt.org/1f/f0/1ff082cf5844efa9f8fecef3294da098a3990c3e-3601788-2326-3400-jpg_250.jpg', 'https://e-hentai.org/g/1284427/35de67170e/');

INSERT INTO toplist_items_2023 (gallery_id, rank, list_date, period_type)
VALUES (596447, 1, '2023-11-15', 'all');
INSERT INTO toplist_items_2023 (gallery_id, rank, list_date, period_type)
VALUES (508505, 2, '2023-11-15', 'all');
INSERT INTO toplist_items_2023 (gallery_id, rank, list_date, period_type)
VALUES (722215, 3, '2023-11-15', 'all');
INSERT INTO toplist_items_2023 (gallery_id, rank, list_date, period_type)
VALUES (2055704, 4, '2023-11-15', 'all');
INSERT INTO toplist_items_2023 (gallery_id, rank, list_date, period_type)
VALUES (1284427, 5, '2023-11-15', 'all');