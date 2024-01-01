## Welcome to Steve Teoh's Public Health Monitoring Repo - Head, Foot and Mouth Disease (HFMD)

Last Updated: 
<br/>Created:  

Welcome to Steve Teoh's public health github page. This page highlights the shared sources available in _https://steveteoh.github.io_ for demo and educational purposes. It is a public-domain CSR with National Institute of Health to help monitor the spread of HFMD.

### Data Sources
Map Data Last Updated: 01/01/2024<br>
7-day active cases data is sourced from mysejahtera app through api lookup. Contact the [author](mailto:chteoh@ieee.org?subject=Mysejahtera "Mysejahtera") for info about how to extract data from mysejahtera.<br>
Note: 
Latest Mysejahtera json format as of 27/9/2022 (changes in the sequence of elements):
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

### HFMD Hex Maps for Malaysia
(Legend and styles updated)  (New)
Below are state-level maps for : <br>
1. [Klang Valley (Selangor, Kuala Lumpur dan Putrajaya)](https://steveteoh.github.io/diseases/hfmd/KlangValley/) (last updated 01/01/2024), <br>
   Ver 4.4.0.1 of Klang Valley now supports selection of dates using the request format: <br>
   [https://steveteoh.github.io/diseases/hfmd/KlangValley/?date=20240101](https://steveteoh.github.io/diseases/hfmd/KlangValley/) <br>
   The rest just shows the map using the latest data. <br><br>   ![Klang Valley](https://steveteoh.github.io/img/ms-klangvalley.jpg)

2. [Johor](http://steveteoh.github.io/diseases/hfmd/Johor/?date=20230611) (last updated 01/01/24), <br>        |
3. [Kedah](https://steveteoh.github.io/diseases/hfmd/Kedah/?date=20230611) (last updated 01/01/24), <br>  |
4. [Kelantan](https://steveteoh.github.io/diseases/hfmd/Kelantan/?date=20230611) (last updated 01/01/24), <br>  |
5. [Melaka](http://steveteoh.github.io/diseases/hfmd/Melaka/?date=20230611) (last updated 01/01/24), <br>  |
6. [Negeri Sembilan](http://steveteoh.github.io/diseases/hfmd/NegeriSembilan/?date=20230611) (last updated 01/01/24), <br>  |
7. [Pahang](https://steveteoh.github.io/diseases/hfmd/Pahang/?date=20230611) (last updated 01/01/24), <br>  |
8. [Penang](http://steveteoh.github.io/diseases/hfmd/Penang/?date=20230611) (last updated 01/01/24), <br>  |
9. [Perak](https://steveteoh.github.io/diseases/hfmd/Perak/?date=20230611) (last updated 01/01/24), <br>  |
10. [Perlis](https://steveteoh.github.io/diseases/hfmd/Perlis/?date=20230611) (last updated 01/01/24), <br>  |
11. [Sabah](http://steveteoh.github.io/diseases/hfmd/Sabah/?date=20230611) (last updated 01/01/24), <br>  |
12. [Sarawak](http://steveteoh.github.io/diseases/hfmd/Sarawak/?date=20230611) (last updated 01/01/24), <br>  |
13. [Terengganu](https://steveteoh.github.io/diseases/hfmd/Terengganu/?date=20230611) (last updated 01/01/24), <br>  |
14. [Wilayah Persekutuan](http://steveteoh.github.io/diseases/hfmd/Wilayah/) <br>  |
    [Kuala Lumpur](http://steveteoh.github.io/diseases/hfmd/KualaLumpur/) (last updated 01/01/24), <br>  |
    [Putrajaya](http://steveteoh.github.io/diseases/hfmd/Putrajaya/) (last updated 01/01/24), <br>  |
    [Labuan](http://steveteoh.github.io/diseases/hfmd/Labuan/) (last updated 01/01/24).<br>  | 
 
Note: 
1. The javascripts are minified and obfuscated for faster performance. Kindly email me on the link below if you wish to have the raw code. 
2. Some maps may be too large (Sarawak, Sabah, Pahang) and hence the performance and display on the client side will be extremely slow, particularly when the markers are enabled. 
   A server side clustering solution is available.


### HFMD Hex Maps for Wilayah Persekutuan Districts
Below are standalone maps for Wilayah Persekutuan districts: <br>
1. [Kuala Lumpur](http://steveteoh.github.io/diseases/hfmd/KualaLumpur) (last updated 01/01/24),<br>
2. [Putrajaya](http://steveteoh.github.io/diseases/hfmd/Putrajaya) (last updated 01/01/24), and<br>
3. [Labuan](http://steveteoh.github.io/diseases/hfmd/Labuan) (last updated 01/01/24).<br>

### HFMD Hex Maps for Penang Districts
Below are standalone maps for Penang districts: <br>
1. [Penang state](http://steveteoh.github.io/diseases/hfmd/Penang/index.html) (last updated 01/01/24),  <br>
2. [Penang island](http://steveteoh.github.io/diseases/hfmd/Penang/island.html) (last updated 01/01/24), and  <br>
3. [Seberang Perai](http://steveteoh.github.io/diseases/hfmd/Penang/perai.html) (last updated 01/01/24). <br>

General Note: The javascripts are minified and obfuscated for faster performance. Kindly email me on the link below if you wish to have the raw code. 


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
[MIT](https://steveteoh.github.io/diseases/hfmd/LICENSE)

#### Author
**Steve Teoh** (B.S, MSc, PhD, PTech, MIET, SMIEEE)

### Issues and Contact
Kindly contact Steve Teoh at [@teohcheehooi](https://twitter.com/teohcheehooi) or email to [Steve](mailto:chteoh@ieee.org?subject=Map "Map")
