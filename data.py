"""
SCRIPT DE DATOS VISUALIZACIÓN DE CNID MAPA MONITOREO.

Como input este archivo recibe los csv de datos de monitoreo de CNID 
para el mapa de estudios de investigadores.
Los archivos deben llamarse hitos.csv y preguntas.csv para ser procesados
y producen el archivo data.json para alimentar estaticamente la visualización.

Copyright (c) 2018, Fernando Florenzano
"""

import json
import csv
import os

os.chdir('data')

print('PROCESSING DATA')
with open('datos.csv', newline='', encoding="utf-8") as csvfile:
    reader = csv.reader(csvfile)
    dataJson = []
    rownum = 0
    for row in reader:
        if rownum == 0:
            header = row
        else:
            colnum = 0
            datum = {}
            for col in row:
                if header[colnum] in ['categoria', 'institucion_estudio', 
                                      'pais_rec', 'ofos1_rec', 'grado_rec']:
                    datum[header[colnum]] = list(filter(lambda x: x != '', 
                                                       col.split(',')))
                elif header[colnum] in [ 'ID_investigadores']:
                    datum[header[colnum]] = col
                colnum += 1
            dataJson.append(datum)
        rownum += 1
    with open('datos_simples.json', 'w', encoding="utf-8") as f:
        json.dump(dataJson, f, ensure_ascii=False)

with open('datos_simples.json', encoding="utf-8") as simple_file:
    data = json.loads(simple_file.read())
    filtered = []
    for datum in data:
        largo = len(datum['grado_rec'])
        append = True
        for attr in ['categoria', 'institucion_estudio', 'pais_rec', 'ofos1_rec', 'grado_rec']:
            if len(datum[attr]) != largo:
                # print('ERROR: largos no calzan en ' + attr + ': ' + datum['ID_investigadores'])
                # print(str(largo) + ' vs ' + str(len(datum[attr])))
                append  = False
                break
        if append:
            filtered.append(datum)
    print('FILTERED: ' + str(len(data) - len(filtered)) + '. TOTAL:' + str(len(filtered)))
    with open('datos_filtrados.json', 'w', encoding="utf-8") as f:
        json.dump(filtered, f, ensure_ascii=False)

with open('datos_filtrados.json', encoding="utf-8") as file:
    data = json.loads(file.read())
    expanded_data = []
    expanded_count = 0
    for datum in data:
        current_id = -1
        for i in range(len(datum['pais_rec'])):
            if i == 0:
                current_id = datum['pais_rec'][i]
            else:
                if current_id != datum['pais_rec'][i]:
                    expanded_datum = {}
                    expanded_datum['id'] = datum[ 'ID_investigadores']
                    expanded_datum['grado'] = datum[ 'grado_rec'][i]
                    expanded_datum['ofos'] = datum[ 'ofos1_rec'][i]
                    expanded_datum['insti'] = datum[ 'institucion_estudio'][i]
                    expanded_datum['categoria'] = datum[ 'categoria'][i]
                    expanded_datum['origen'] = current_id
                    expanded_datum['destino'] = datum[ 'pais_rec'][i]
                    expanded_data.append(expanded_datum)
                expanded_count += 1
                current_id = datum['pais_rec'][i]

    print('FILTERED CHANGES: ' + str(expanded_count) + ' INTO: ' + str(len( expanded_data )))
    with open('datos_expandidos.json', 'w', encoding="utf-8") as f:
        json.dump(expanded_data, f, ensure_ascii=False)

def detail(edu_list):
    detail_obj = {}
    detail_obj['amount'] = len(edu_list)
    detail_obj['ofos'] = []
    for ofo in range(1,7):
         detail_obj['ofos'].append({
             'ofo': ofo,
             'amount': len( list( filter( lambda x: x['ofos'] == str(ofo), edu_list) ) )
         })
    inst_dict = {}
    for edu in edu_list:
        if edu['insti'] not in inst_dict:
            inst_dict[edu['insti']] = 1
        else:
            inst_dict[edu['insti']] += 1
    detail_obj['institutions'] = [ {'institution': k, 'amount': v} for k,v in inst_dict.items()]
    return detail_obj


def aggregate(od_dict):
    summary = []
    for k in list(od_dict.keys()):
        origen = od_dict[k][0]['origen']
        destino = od_dict[k][0]['destino']
        if  not (origen == "#N/A" or destino == "#N/A"):
            obj = {}
            obj['origen'] = origen
            obj['destino'] = destino
            obj['licen'] =  detail(list( filter( lambda x: x['categoria'] == '1', od_dict[k])))
            obj['mast'] = detail( list( filter( lambda x: x['categoria'] == '3', od_dict[k])))
            obj['doct'] = detail( list( filter( lambda x: x['categoria'] == '4', od_dict[k])))
            obj['postdoc'] = detail(list( filter( lambda x: x['categoria'] == '5', od_dict[k])))
            obj['overall'] = detail( od_dict[k])
            summary.append(obj)
    summary_dict = {}
    for s in summary:
        summary_dict[s['origen']+'-'+s['destino']] = s
    return summary_dict


with open('datos_expandidos.json', encoding="utf-8") as file:
    data = json.loads(file.read())
    od_dict = {}
    for datum in data:
        key = datum['origen'] + ' ' + datum['destino']
        if key not in od_dict:
            od_dict[key] = [datum]
        else:
            od_dict[key].append(datum)
    summary = aggregate(od_dict)
    with open('pais.csv', newline='', encoding="utf-8") as csvfile:
        reader = csv.reader(csvfile)
        dataJson = []
        rownum = 0
        for row in reader:
            if rownum == 0:
                header = row
            else:
                colnum = 0
                datum = {}
                for col in row:
                    if header[colnum] in ['lat', 'long']:
                        datum[header[colnum]] = float(col)
                    else:
                        datum[header[colnum]] = col
                    colnum += 1
                dataJson.append(datum)
            rownum += 1
        pais_dict = {}
        for data in dataJson:
            pais_dict[data['id_pais']] = data
        for pais in pais_dict.keys():
            pais_dict[pais]["dest"] = []
            for summ in summary.values():
                if summ['origen'] == pais:
                    pais_dict[pais]["dest"].append(summ["destino"])

        with open('ofos_1.csv', newline='', encoding="utf-8") as csvofos:
            ofos = csv.reader(csvofos)
            data = []
            rownum = 0
            for row in ofos:
                if rownum == 0:
                    header = row
                else:
                    colnum = 0
                    datum = {}
                    for col in row:
                        datum[header[colnum]] = col
                        colnum += 1
                    data.append(datum)
                rownum += 1
            ofosJson = {}
            for d in data:
                ofosJson[d['id_ofos1']] = d['ofos_1']
            obj = {
                'summary': summary,
                'countries': pais_dict,
                'ofos': ofosJson
            }
        with open('datos_agregados.json', 'w', encoding="utf-8") as f:
            json.dump(obj, f, ensure_ascii=False)