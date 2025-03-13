-- npx wrangler d1 execute ehentai-toplist-archive --local --file=./src/db/mock.sql
-- npx wrangler d1 execute ehentai-toplist-archive --local --command="SELECT * FROM toplist_items_2025"

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

INSERT INTO galleries (gallery_id, gallery_name, gallery_type, tags, published_time, uploader, gallery_length, points, torrents_url, preview_url, gallery_url) 
VALUES (3176443, '[Ringoya (Alp)] Otaku Tomodachi to no Sex wa Saikou ni Kimochi Ii 3  [Chinese] [無邪気漢化組] [Digital]', 'Doujinshi', 'chinese, translated, original, f:anal intercourse, f:anal, f:asphyxiation, f:big breasts, f:blowjob, f:chinese dress, f:deepthroat, f:exposed clothing, f:glasses', '2024-12-30', 'Kaito.', 104, 842097, 'https://e-hentai.org/gallerytorrents.php?gid=3176443&t=3c35f14f9e', 'https://ehgt.org/w/01/699/65397-gbdvzu9k.webp', 'https://e-hentai.org/g/3176443/3c35f14f9e/');
INSERT INTO galleries (gallery_id, gallery_name, gallery_type, tags, published_time, uploader, gallery_length, points, torrents_url, preview_url, gallery_url)
VALUES (3176494, "[Vpan's EXTASY (Satou Kuuki)] Vanishing Reality 2 ~Mashou Zessei~ [Digital]", 'Doujinshi', 'original, f:big breasts, f:corruption, f:crotch tattoo, f:gloves, f:leotard, f:magical girl, f:netorare, f:sole female, f:stockings, f:tentacles, m:gender change', '2024-12-30', 'みぅく', 54, 411912, 'https://e-hentai.org/gallerytorrents.php?gid=3176494&t=6958f50f99', 'https://ehgt.org/w/01/699/69633-ftczila0.webp', 'https://e-hentai.org/g/3176494/6958f50f99/');
INSERT INTO galleries (gallery_id, gallery_name, gallery_type, tags, published_time, uploader, gallery_length, points, torrents_url, preview_url, gallery_url)
VALUES (3176518, '[Bad Mushrooms (Chicke III, 4why)] 1/5 no Renai Kanjou (Gotoubun no Hanayome) [Chinese] [Digital]', 'Doujinshi', 'chinese, gotoubun no hanayome, ichika nakano, nino nakano, f:anal, f:big breasts, f:blowjob, f:multimouth blowjob, m:sole male, x:ffm threesome, x:group, bad mushrooms', '2024-12-30', 'みぅく', 135, 390021, 'https://e-hentai.org/gallerytorrents.php?gid=3176518&t=12d331b200', 'https://ehgt.org/w/01/699/71343-boy074hs.webp', 'https://e-hentai.org/g/3176518/12d331b200/');
INSERT INTO galleries (gallery_id, gallery_name, gallery_type, tags, published_time, uploader, gallery_length, points, torrents_url, preview_url, gallery_url)
VALUES (3177735, '[Ringoya (Alp)] Otaku Tomodachi to no Sex wa Saikou ni Kimochi Ii 3  [Chinese] [無邪気漢化組] [Digital]', 'Doujinshi', 'chinese, translated, original, f:anal intercourse, f:anal, f:asphyxiation, f:big breasts, f:blowjob, f:chinese dress, f:deepthroat, f:exposed clothing, f:glasses', '2024-12-31', 'Kaito.', 104, 332508, 'https://e-hentai.org/gallerytorrents.php?gid=3177735&t=8a357ad791', 'https://ehgt.org/w/01/699/65397-gbdvzu9k.webp', 'https://e-hentai.org/g/3177735/8a357ad791/');
INSERT INTO galleries (gallery_id, gallery_name, gallery_type, tags, published_time, uploader, gallery_length, points, torrents_url, preview_url, gallery_url)
VALUES (3177247, '[小飞鼠(Smallflyingrat)] 危城（全本）', 'Misc', 'chinese, f:blackmail, f:blowjob, f:bondage, f:gag, f:pregnant, smallflyingrat, 3d, uncensored', '2024-12-31', 'smallflyingrat', 386, 328084, 'https://e-hentai.org/gallerytorrents.php?gid=3177247&t=fb24142e8b', 'https://ehgt.org/w/01/700/52376-p0tx9w6u.webp', 'https://e-hentai.org/g/3177247/fb24142e8b/');
INSERT INTO galleries (gallery_id, gallery_name, gallery_type, tags, published_time, uploader, gallery_length, points, torrents_url, preview_url, gallery_url)
VALUES (3176723, '[jayep] 妖女大陆01-02', 'Misc', 'chinese, f:big breasts, m:big penis, m:shotacon, 3d, uncensored', '2024-12-30', 'seinicht1111', 714, 259959, 'https://e-hentai.org/gallerytorrents.php?gid=3176723&t=522c4b2761', 'https://ehgt.org/w/01/700/01115-kt9kng6d.webp', 'https://e-hentai.org/g/3176723/522c4b2761/');

INSERT INTO galleries (gallery_id, gallery_name, gallery_type, tags, published_time, uploader, gallery_length, points, torrents_url, preview_url, gallery_url)
VALUES (3177985, '[もすきーと音。 (ぐれーともす)] 文学少女は染められる2（是小狐狸哦）', 'Doujinshi', 'chinese, translated, original, f:big breasts, f:bikini, f:eye-covering bang, f:kemonomimi, f:netorare, f:netorase, f:schoolgirl uniform, f:sole female, f:stockings', '2024-12-31', 'mini13', 61, 123904, 'https://e-hentai.org/gallerytorrents.php?gid=3177985&t=279fe416ec', 'https://ehgt.org/w/01/698/60917-h38v11mt.webp', 'https://e-hentai.org/g/3177985/279fe416ec/');
INSERT INTO galleries (gallery_id, gallery_name, gallery_type, tags, published_time, uploader, gallery_length, points, torrents_url, preview_url, gallery_url)
VALUES (3176542, '[Fatalpulse (Asanagi)] Jinsei Recycle - RECYCLE of the LIFE [Digital]', 'Doujinshi', 'original, f:ahegao, f:asphyxiation, f:big breasts, f:blowjob, f:eye-covering bang, f:foot licking, f:nakadashi, f:stockings, f:twintails, f:x-ray, m:glasses', '2024-12-30', 'みぅく', 53, 105354, 'https://e-hentai.org/gallerytorrents.php?gid=3176542&t=6820d31b49', 'https://ehgt.org/w/01/699/73435-b4np9kjl.webp', 'https://e-hentai.org/g/3176542/6820d31b49/');
INSERT INTO galleries (gallery_id, gallery_name, gallery_type, tags, published_time, uploader, gallery_length, points, torrents_url, preview_url, gallery_url)
VALUES (3176507, '[Aodouhu (Neromashin)] Omae no Kaa-chan Ikutoki no Kao Sugee Busu da zo w After [Digital]', 'Doujinshi', 'original, f:ahegao, f:anal intercourse, f:anal, f:ball sucking, f:bbw, f:beauty mark, f:big areolae, f:big ass, f:big breasts, f:big nipples, f:bikini', '2024-12-30', 'nothingbutfire', 50, 889434, 'https://e-hentai.org/gallerytorrents.php?gid=3176507&t=f5db53806e', 'https://ehgt.org/w/01/699/69556-0inrzi5m.webp', 'https://e-hentai.org/g/3176507/f5db53806e/');
INSERT INTO galleries (gallery_id, gallery_name, gallery_type, tags, published_time, uploader, gallery_length, points, torrents_url, preview_url, gallery_url)
VALUES (3177297, '(C105) [Gessyu (Chouzetsu Bishoujo mine)] Gehenna no Meushi 2 (Blue Archive) [Chinese] [空気系☆漢化]', 'Doujinshi', 'chinese, translated, blue archive, ako amau, f:big breasts, f:halo, f:lactation, f:stockings, gessyu, chouzetsu bishoujo mine', '2024-12-31', 'NEET☆遥', 24, 129652, 'https://e-hentai.org/gallerytorrents.php?gid=3177297&t=1ef869cbb4', 'https://ehgt.org/w/01/700/58562-dfdi897c.webp', 'https://e-hentai.org/g/3177297/1ef869cbb4/');


INSERT INTO toplist_items_2025 (gallery_id, rank, list_date, period_type)
VALUES (3176443, 1, '2025-01-01', 'day');
INSERT INTO toplist_items_2025 (gallery_id, rank, list_date, period_type)
VALUES (3176494, 2, '2025-01-01', 'day');
INSERT INTO toplist_items_2025 (gallery_id, rank, list_date, period_type)
VALUES (3176518, 3, '2025-01-01', 'day');
INSERT INTO toplist_items_2025 (gallery_id, rank, list_date, period_type)
VALUES (3177735, 4, '2025-01-01', 'day');
INSERT INTO toplist_items_2025 (gallery_id, rank, list_date, period_type)
VALUES (3177247, 5, '2025-01-01', 'day');
INSERT INTO toplist_items_2025 (gallery_id, rank, list_date, period_type)
VALUES (3176723, 6, '2025-01-01', 'day');
INSERT INTO toplist_items_2025 (gallery_id, rank, list_date, period_type)
VALUES (3177985, 7, '2025-01-01', 'day');
INSERT INTO toplist_items_2025 (gallery_id, rank, list_date, period_type)
VALUES (3176542, 8, '2025-01-01', 'day');
INSERT INTO toplist_items_2025 (gallery_id, rank, list_date, period_type)
VALUES (3176507, 9, '2025-01-01', 'day');
INSERT INTO toplist_items_2025 (gallery_id, rank, list_date, period_type)
VALUES (3177297, 10, '2025-01-01', 'day');
