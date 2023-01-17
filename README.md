## Welcome to Steve Teoh's Public Health Monitoring Repo

Last Updated: 18/01/2023
<br/>Created: 26/08/2021 

Welcome to Steve Teoh's public health github page. This page highlights the shared sources available in _https://steveteoh.github.io_ for demo and educational purposes.  This page highlights the shared sources available in _https://steveteoh.github.io_ for demo purposes. It is a public-domain CSR with National Institute of Health to help monitor the spread of COVID-19.

### Data Sources
Map Data Last Updated: 12/01/2023<br>
14-day active cases data is sourced from mysejahtera app through api lookup. Contact the [author](mailto:chteoh@1utar.my?subject=Mysejahtera "Mysejahtera") for info about how to extract data from mysejahtera.<br>
Note: 
- Since **13/01/2023**, the MYsejahtera query response has returned all zeros for Covid-19 cases nationwide. It is impossible that a infectious disease can just suddenly vanish into thin air.
 - Upon closer inspection, there is a likelyhood that the **Covid-19** data column was mixed up with **HFMD** or **TB** which suddenly showed a widespread coverage. 
 - In order to assess the nature of the problem, I have collected raw data of several smaller areas in json format for analysis.
 - Below are the links to the some of the smaller json output for comparison with the corresponding csv files for side by side comparison:
   [20230118 KL Raw Data](https://steveteoh.github.io/data/wp/20230118_KL.raw.json)                    [20230118 KL csv file](https://steveteoh.github.io/data/wp/20230118_KL.csv)
   [20230118 Putrajaya Raw Data](https://steveteoh.github.io/data/wp/20230118_Putrajaya.raw.json)      [20230118 Putrajaya csv file](https://steveteoh.github.io/data/wp/20230118_Putrajaya.csv)
   [20230118 Labuan Raw Data](https://steveteoh.github.io/data/wp/20230118_Labuan.raw.json)            [20230118 Labuan csv file](https://steveteoh.github.io/data/wp/20230118_Labuan.csv)

 - It turns out that there is a possibility that the Mysejahtera programmer has accidentally swapped the data columns. It certainly reflects very bad on a software purportedly worth more than RM 70 million!
 - I am now doing a trial on error by swapping the columns with most active cases, i.e. HFMD and TB columns with the Covid-19 column for the csv datasource from 18/1/2023 onwards. 
 - If the map output looks peculiar, please let me know. Thank you very much.

- Map data from **09/05/2022** to **08/07/2022** were all zeroes due to the old hotspots interface API location _https://mysejahtera.malaysia.gov.my/register/api/nearby/hotspots?type=locateme_ being superceded by _https://mysejahtera.malaysia.gov.my/epms/v1/hotspot/nearby?type=locateme_ <br>
- The request json is still the same
```
[{
"lat" : "3.0926898",
"lng" : "101.7342783",
"classification":"LOW_RISK_NS"
}]
```
- However, the old json response: 
```
{"hotSpots":[],"zoneType":"GREEN","messages":{"ms_MY":"Hai {name}, tiada kes COVID-19 dalam lingkungan radius 1km dari lokasi ini yang dilaporkan dalam masa 14 hari yang lepas.","en_US":"Hi {name}, there have been no reported case(s) of COVID-19 within a 1km radius from your searched location in the last 14 days."},"note":null} 
```
is now superceded by a new version with the following format in Mysejahtera ver 2.x.x :<br>
```
{"hotSpots":[
{"disease":"COVID-19","displayName":{"enUS":"COVID-19","msMY":"COVID-19"},"iconUri":"/hotspot/icons/COVID19.svg","activeCases":31,"radiusInMeters":1000.0,"durationInDays":14}, 
{"disease":"DENGUE","displayName":{"enUS":"Dengue","msMY":"Denggi"},"iconUri":"/hotspot/icons/dengue.svg","activeCases":0,"radiusInMeters":200.0,"durationInDays":14}, 
{"disease":"RABIES","displayName":{"enUS":"Human Rabies","msMY":"Rabies dalam manusia"},"iconUri":"/hotspot/icons/rabies.svg","activeCases":0,"radiusInMeters":1000.0,"durationInDays":90}, 
{"disease":"MEASLES","displayName":{"enUS":"Measles","msMY":"Demam Campak"},"iconUri":"/hotspot/icons/measles.svg","activeCases":0,"radiusInMeters":1000.0,"durationInDays":25}, 
{"disease":"HFMD","displayName":{"enUS":"Hand, Foot & Mouth Disease","msMY":"Penyakit Tangan, Kaki & Mulut​"},"iconUri":"/hotspot/icons/HFMD.svg","activeCases":3,"radiusInMeters":5000.0,"durationInDays":7}, 
{"disease":"TB","displayName":{"enUS":"Tuberculosis","msMY":"Tibi"},"iconUri":"/hotspot/icons/TB.svg","activeCases":1,"radiusInMeters":1000.0,"durationInDays":60}, 
{"disease":"ANIMAL_RABIES","displayName":{"enUS":"Animal Rabies","msMY":"Rabies dalam haiwan"},"iconUri":"/hotspot/icons/rabiesCircle.svg","activeCases":0,"radiusInMeters":5000.0,"durationInDays":180} 
]}
```
<br>
Warning: <br>
The old API will still respond to requests, but it will not give you the correct no of cases for each lookup (all zeroes!). <br>
This would also mean that the hotspots lookup feature will not work on older versions of mysejahtera mobile app (v 1.0.x to 1.1.8).<br><br>

Latest format as of 27/9/2022 (changes in the sequence of elements):
```
{"hotSpots":[
{"disease":"RABIES","displayName":{"enUS":"Human Rabies","msMY":"Rabies dalam manusia"},"iconUri":"/hotspot/icons/rabies.svg","activeCases":0,"radiusInMeters":1000.0,"durationInDays":90},
{"disease":"TB","displayName":{"enUS":"Tuberculosis","msMY":"Tibi"},"iconUri":"/hotspot/icons/TB.svg","activeCases":0,"radiusInMeters":1000.0,"durationInDays":60},
{"disease":"DENGUE","displayName":{"enUS":"Dengue","msMY":"Denggi"},"iconUri":"/hotspot/icons/dengue.svg","activeCases":0,"radiusInMeters":200.0,"durationInDays":14},
{"disease":"ANIMAL_RABIES","displayName":{"enUS":"Animal Rabies","msMY":"Rabies dalam haiwan"},"iconUri":"/hotspot/icons/rabiesCircle.svg","activeCases":0,"radiusInMeters":5000.0,"durationInDays":180},
{"disease":"HFMD","displayName":{"enUS":"Hand, Foot & Mouth Disease","msMY":"Penyakit Tangan, Kaki & Mulut?"},"iconUri":"/hotspot/icons/HFMD.svg","activeCases":0,"radiusInMeters":5000.0,"durationInDays":7},
{"disease":"COVID-19","displayName":{"enUS":"COVID-19","msMY":"COVID-19"},"iconUri":"/hotspot/icons/COVID19.svg","activeCases":0,"radiusInMeters":1000.0,"durationInDays":14},
{"disease":"MEASLES","displayName":{"enUS":"Measles","msMY":"Demam Campak"},"iconUri":"/hotspot/icons/measles.svg","activeCases":0,"radiusInMeters":1000.0,"durationInDays":25}
]}
```
<br>

### Statistic Maps for Malaysia based on KKM's Official Data Source (New)
Here is the latest statistical map that contains district-level variables. The dropdown options are automatically generated ( based on data from https://github.com/MoH-Malaysia/covid19-public ) 
[District-level statistics page](https://steveteoh.github.io/Statistics/main2.html). <br>
Just point to the respective zone for total of that area. Zoom in and double click the coloured districts for more information. <br><br>
![District-level Statistic Maps](https://steveteoh.github.io/img/statistics2.png) <br>

Here is the statistical map that contains all state-level variables. The dropdown options are automatically generated (based on data from https://github.com/MoH-Malaysia/covid19-public )  
[State-level statistics page](https://steveteoh.github.io/Statistics/). <br>Just point to the respective zone for total of that area. <br><br>     
![State-level Statistic Maps](https://steveteoh.github.io/img/statistics.png) <br>

### Covid-19 Hex Maps for Malaysia
(Legend and styles updated)  (New)
Below are state-level maps for : <br>
1. [Klang Valley (Selangor, Kuala Lumpur dan Putrajaya)](http://steveteoh.github.io/KlangValley/) (last updated 18/07/2022, 09/05/2022), <br>
   Ver 4.4.0.1 of Klang Valley now supports selection of dates using the request format: <br>
   [https://steveteoh.github.io/KlangValley/?date=20220716](https://steveteoh.github.io/KlangValley/?date=20220716) <br>
   The rest just shows the map using the latest data. <br><br>   ![Klang Valley](https://steveteoh.github.io/img/klangvalley.jpg)

2. [Johor](http://steveteoh.github.io/Johor/) (last updated 18/07/2022, 08/05/22), <br>        |
3. [Kedah](https://steveteoh.github.io/Kedah/) (last updated 18/07/2022, 08/05/22), <br>  |
4. [Kelantan](https://steveteoh.github.io/Kelantan/) (last updated 18/07/2022, 08/05/22), <br>  |
5. [Melaka](http://steveteoh.github.io/Melaka/) (last updated 18/07/2022, 08/05/22), <br>  |
6. [Negeri Sembilan](http://steveteoh.github.io/NegeriSembilan/) (last updated 18/07/2022, 08/05/22), <br>  |
7. [Pahang](https://steveteoh.github.io/Pahang/) (last updated 18/07/2022, 08/05/22), <br>  |
8. [Penang](http://steveteoh.github.io/Penang/) (last updated 18/07/2022, 08/05/22), <br>  |
9. [Perak](https://steveteoh.github.io/Perak/) (last updated 18/07/2022, 08/05/22), <br>  |
10. [Perlis](https://steveteoh.github.io/Perlis/) (last updated 18/07/2022, 08/05/22), <br>  |
11. [Sabah](http://steveteoh.github.io/Sabah/) (last updated 18/07/2022, 08/05/22), <br>  |
12. [Sarawak](http://steveteoh.github.io/Sarawak/) (last updated 18/07/2022, 08/05/22), <br>  |
13. [Terengganu](https://steveteoh.github.io/Terengganu/) (last updated 18/07/2022, 08/05/22), <br>  |
14. [Wilayah Persekutuan](http://steveteoh.github.io/Wilayah/) <br>  |
    [Kuala Lumpur](http://steveteoh.github.io/KualaLumpur/) (last updated 18/07/2022, 08/05/22), <br>  |
    [Putrajaya](http://steveteoh.github.io/Putrajaya/) (last updated 18/07/2022, 08/05/22), <br>  |
    [Labuan](http://steveteoh.github.io/Labuan/) (last updated 18/07/2022, 08/05/22).<br>  | 
 
Note: 
1. The javascripts are minified and obfuscated for faster performance. Kindly email me on the link below if you wish to have the raw code. 
2. Some maps may be too large (Sarawak, Sabah, Pahang) and hence the performance and display on the client side will be extremely slow, particularly when the markers are enabled. 
   A server side clustering solution is available.

### <---Deprecated --->
### Covid-19 Hex Maps for Selangor Districts
Below are standalone maps for Selangor districts: <br>
1. [Ampang Jaya](http://steveteoh.github.io/Selangor/AmpangJaya/) (last updated 18/07/2022, 08/05/22), <br>
2. [Hulu Langat](http://steveteoh.github.io/Selangor/HuluLangat/) (last updated 18/07/2022, 08/05/22), <br>
3. [Hulu Selangor](http://steveteoh.github.io/Selangor/HuluSelangor/) (last updated 18/07/2022, 08/05/22), <br>
4. [Klang](http://steveteoh.github.io/Selangor/Klang/) (last updated 18/07/2022, 08/05/22), <br>
5. [Kuala Langat](http://steveteoh.github.io/Selangor/KualaLangat/) (last updated 18/07/2022, 08/05/22), <br>
6. [Kuala Selangor](http://steveteoh.github.io/Selangor/KualaSelangor/) (last updated 18/07/2022, 08/05/22), <br>
7. [Petaling Jaya](http://steveteoh.github.io/Selangor/PetalingJaya/) (last updated 18/07/2022, 08/05/22), <br>
8. [Sabak Bernam](http://steveteoh.github.io/Selangor/SabakBernam) (last updated 18/07/2022, 08/05/22), <br>
9. [Selayang](http://steveteoh.github.io/Selangor/Selayang/) (last updated 18/07/2022, 08/05/22), <br>
10. [Sepang](http://steveteoh.github.io/Selangor/Sepang/) (last updated 18/07/2022, 08/05/22), <br>
11. [Shah Alam](http://steveteoh.github.io/Selangor/ShahAlam/) (last updated 18/07/2022, 08/05/22), and  <br>
12. [Subang Jaya](http://steveteoh.github.io/Selangor/SubangJaya/) (last updated 18/07/2022, 08/05/22).<br>

### Covid-19 Hex Maps for Wilayah Persekutuan Districts
Below are standalone maps for Wilayah Persekutuan districts: <br>
1. [Kuala Lumpur](http://steveteoh.github.io/KualaLumpur) (last updated 18/07/2022, 08/05/22),<br>
2. [Putrajaya](http://steveteoh.github.io/Putrajaya) (last updated 18/07/2022, 08/05/22), and<br>
3. [Labuan](http://steveteoh.github.io/Labuan) (last updated 18/07/2022, 08/05/22).<br>

### Covid-19 Hex Maps for Penang Districts
Below are standalone maps for Penang districts: <br>
1. [Penang state](http://steveteoh.github.io/Penang/index.html) (last updated 18/07/2022, 08/05/22),  <br>
2. [Penang island](http://steveteoh.github.io/Penang/island.html) (last updated 18/07/2022, 08/05/22), and  <br>
3. [Seberang Perai](http://steveteoh.github.io/Penang/perai.html) (last updated 18/07/2022, 08/05/22). <br>

General Note: The javascripts are minified and obfuscated for faster performance. Kindly email me on the link below if you wish to have the raw code. 

### MalaysiaHeatmap
[My shared code](http://steveteoh.github.io/MalaysiaHeatMap) derived from [Khoo Hao Yit's work](https://github.com/KhooHaoYit/KhooHaoYit.github.io/tree/main/Covid19%20Malaysia%20Heatmap)

### HexGrid (Concepts)
[My shared code](http://steveteoh.github.io/HexGrid) derived from [https://github.com/ondeweb/Hexagon-Grid-overlay-on-Google-Map](https://github.com/ondeweb/Hexagon-Grid-overlay-on-Google-Map) 

### Built With

- Google Maps API
- JavaScript
- node.js (server version is not included here)
- Visual Studio Code
- HTML
- CSS

### 🤝 Contribution and Support
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

### Version History
Hex Map for Malaysia - latest revision is 4.5.
Note: Kindly email me on the link below if you wish to have the raw code. 

### License
[MIT](https://steveteoh.github.io/LICENSE)

#### Author
**Steve Teoh** (B.S, MSc, PhD, PTech, MIET, SMIEEE)

### Issues and Contact
Kindly contact Steve Teoh at [@teohcheehooi](https://twitter.com/teohcheehooi) or email to [Steve](mailto:chteoh@1utar.my?subject=Map "Map")
